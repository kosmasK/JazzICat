import tensorflow as tf
from tensorflow.keras.callbacks import LambdaCallback, ModelCheckpoint
from tensorflow.keras.layers import InputLayer, Input, Dense, TimeDistributed, LSTM, RepeatVector, Dropout, GRU, CuDNNLSTM, Activation
from tensorflow.keras.models import Model, Sequential, load_model
from tensorflow.keras import regularizers
from tensorflow.keras.datasets import mnist
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import utils as np_utils
from tensorflow.keras.callbacks import TensorBoard


#generator 
from tensorflow.keras.utils import Sequence

import argparse
from scipy.ndimage.interpolation import shift
import numpy as np
import matplotlib.pyplot as plt
import os
import sys
import pickle
import random
from datetime import datetime
import time
import re

import get_data as gd
import models as my_models

# folder_path = "/media/datadisk/imim/existential_crisis/latest_data"

#helpful functions
def load_onoffset_dicts():
    #load dictionaries

    dict_path_onsets = "/media/datadisk/imim/existential_crisis/latest_data/exp5/parts/part_onsets_in_clean_aggr.pkl"
    dict_onsets = np.load(dict_path_onsets,allow_pickle=True)

    dict_path_offsets = "/media/datadisk/imim/existential_crisis/latest_data/exp5/parts/part_offsets_in_clean_aggr.pkl"
    dict_offsets = np.load(dict_path_offsets,allow_pickle=True)

    return dict_onsets, dict_offsets


def load_harmony_dictionaries(dict_folder_path="/media/datadisk/imim/existential_crisis/latest_data/exp5/parts", dict_prefix="parts"):

    d_chord2int_path = dict_folder_path + os.sep + dict_prefix + "_harmony_chord2int_dict.pkl"
    d_int2chord_path = dict_folder_path + os.sep + dict_prefix + "_harmony_int2chord_dict.pkl"
    
    d_chord2int = np.load(d_chord2int_path, allow_pickle=True)
    d_int2chord = np.load(d_int2chord_path, allow_pickle=True)


    return d_chord2int, d_int2chord



def save_databrick(databrick,folder_path,filename,extension):
    dash_list = ["-" for i in range(len(filename)+20)]
    dash_list = "".join(dash_list)
    
    print("\n"+str(dash_list))
    print(filename,databrick.shape)
    print(dash_list)
    filepath = folder_path+os.sep+filename+extension

    np.savez(filepath, data_brick=databrick)


#creates lists for training and validating, from all parts of dataset
def create_parts_list(args, validation_per):

    path_of_lists = args.saved_models_folder + os.sep + "train_val_id_list.npz"
    print(path_of_lists)

    #in case of training on already trained model, to keep the same id's for training and validation
    if os.path.exists(path_of_lists):
        lists = np.load(path_of_lists)
        
        parts_for_training = lists[lists.files[0]]
        # parts_for_training = parts_for_training.tolist()
        print(parts_for_training)

        parts_for_validation = lists[lists.files[1]]
        # parts_for_validation = parts_for_validation.tolist()
        print(parts_for_validation)

        # exit()
    else:
        dict_onsets, dict_offsets = load_onoffset_dicts()

        #total number of parts(original pitch + transpositions)
        original_pitch_parts = len(dict_onsets)
        # print(original_pitch_parts)
        tot_parts = len(dict_onsets)* 12

        parts_for_training = [ i+1 for i in range(tot_parts)]
        # print(parts_for_training,len(parts_for_training),)
        
        parts_for_validation = [ ]

        val_parts_num = int(np.floor( validation_per * tot_parts ))
        val_parts_from_each_pitch = int(val_parts_num/12)
        

        #randomly select the parts for validation
        random.seed(datetime.now())
        for i in range(12):
            print("\nPitch ", str(i+1))
            print(i*original_pitch_parts+1,i*original_pitch_parts+original_pitch_parts)
            rand_parts_for_val = random.sample(range(i*original_pitch_parts+1,i*original_pitch_parts+original_pitch_parts), val_parts_from_each_pitch) 
            # print(rand_parts_for_val,len(rand_parts_for_val))

            #add part to the validation parts list
            parts_for_validation.extend(rand_parts_for_val)
            
            #delete part from training parts list
            # print(len(parts_for_training))
            parts_for_training = set(parts_for_training) - set(rand_parts_for_val)
            # print(len(parts_for_training))
            

        print("")
        print(len(parts_for_training),len(parts_for_validation))
        parts_for_training = list(parts_for_training)
        # print(tot_parts-val_parts_from_each_pitch*12, len(parts_for_training)- (tot_parts-val_parts_from_each_pitch*12) )

        # parts_for_training =[ i+1 for i in parts_for_training ]
        # path_of_lists = folder_path + "/exp5/parts/train_val_id_list.npz"
        np.savez(path_of_lists, parts_for_training=parts_for_training, parts_for_validation=parts_for_validation)
        

    return parts_for_training, parts_for_validation


#generator
class DataGenerator(Sequence):
    """Generates data for Keras
    Sequence based data generator. Suitable for building data generator for training and prediction.
    """
    def __init__(self, list_IDs, features=20, dim = (16, 20), n_classes = 129, shuffle=False, model_type="human20", step_len=1, past_window_len = 16, to_fit=True, batch_size=128, samples_path="/media/datadisk/imim/existential_crisis/latest_data/exp5/parts/samples"):
        
        """Initialization
        :param list_IDs: list of all parts to use in the generator
        :param to_fit: True to return X and y, False to return X only
        :param batch_size: batch size at each iteration
        :param dim: tuple indicating image dimension
        :param n_classes: number of output masks
        :param shuffle: True to shuffle label indexes after every epoch
        """

        self.list_IDs = list_IDs
        self.to_fit = to_fit
        self.batch_size = batch_size
        self.dim = dim
        self.n_classes = n_classes
        self.shuffle = shuffle
        self.step_len = step_len
        self.past_window_len = past_window_len
        self.features = features
        # human20 / bot21
        self.model_type = model_type
        self.samples_path = samples_path

    def __len__(self):
        """Denotes the number of batches per epoch
        :return: number of batches per epoch
        """
        print(len(self.list_IDs))
        return int(np.floor(len(self.list_IDs)*128 / self.batch_size))

    def __getitem__(self, index):
        """Generate one batch of data
        :param index: index of the batch
        :return: X and y when fitting. X only when predicting
        """
        # Generate indexes of the batch
        # indexes = self.indexes[index * self.batch_size:(index + 1) * self.batch_size]
        # Find list of IDs
        # list_IDs_temp = [self.list_IDs[k] for k in indexes]
        # X = self._generate_X(list_IDs_temp)


        #variables
        #number of part to use for the batch - index of list of parts == index of batch
        part_id = self.list_IDs[index]
        # print(self.list_IDs)

        if self.to_fit:
            # Generate data
            if self.model_type == "human20":
                X, y = self.human_input_batch(part_id)
                return X, y 
        
            elif self.model_type == "bot21":
                X, y = self.bot_input_batch(part_id)
                return X, y
        
        # else: #NOTE ???!?!?!

           
    def on_epoch_end(self):
        """Updates indexes after each epoch
        """
        self.indexes = np.arange(len(self.list_IDs))
        if self.shuffle == True:
            np.random.shuffle(self.indexes)

        # print(self.indexes)

    
    # "brings" beat's and chord_info's future to present, by 1 timestep
    def shift_beat_ch_info(self, databrick, beat_offset, beat_size, ch_info_offset, ch_info_size):

        # print(databrick.shape)
        #NOTE !!!!!!
        databrick = databrick.astype(int)

        databrick[0,:] = shift(databrick[0,:],-1,cval=0)

        for i in range(ch_info_offset, ch_info_offset+ch_info_size, 1):
            databrick[i,:] = shift(databrick[i,:],-1,cval=0)

        # filename = "databrick_aggr_flat_shifted"
        # save_databrick(databrick,saved_folder_path,filename,extension)

        # print(databrick[0])

        return databrick

    # "brings" melody's future to present, by 1 timestep
    def shift_melody(self, databrick, melody_offset, melody_size):

        # print(databrick.shape)
        databrick = databrick.astype(int)
        for i in range(melody_offset, melody_size+melody_offset, 1):
            databrick[i,:] = shift(databrick[i,:],-1,cval=128)

        # filename = "databrick_aggr_flat_shifted"
        # save_databrick(databrick,saved_folder_path,filename,extension)

        return databrick

    def delete_feature(self, data_brick,feat_offset,feat_size):

        data_brick_no_feature = np.vstack((data_brick[:feat_offset,:],data_brick[feat_offset+feat_size:,:]))
        
        return data_brick_no_feature


    #creates 1 batch of input for the human model (shifted num_of_samples samples)
    def human_input_batch(self, part_id):
        
        part_path = self.samples_path + os.sep + "part" + str(part_id) + os.sep + "part" + str(part_id) + ".npz"

        part_brick = np.load(part_path)
        part_brick = part_brick[part_brick.files[0]]

        #delete harmony info from brick
        harmony_offset = 2
        harmony_size = 1
        part_brick = self.delete_feature(part_brick, harmony_offset, harmony_size)

        #shift brick
        beat_offset = 0
        beat_size = 1
        ch_info_offset = 2
        ch_info_size = 18
        part_brick = self.shift_beat_ch_info(part_brick, beat_offset, beat_size, ch_info_offset, ch_info_size)

        x = np.empty((self.batch_size, *self.dim),dtype="float32")
        y = np.empty((self.batch_size, 1), dtype="float32")

        feature_to_classify_offset = 1
        feature_to_classify_size = 1

        # print(self.dim)
        # print("LALA")
        for i in range(0, self.batch_size, self.step_len):
            # Transpose the input examples in order to have time in 0 dimension and features in 1 dimension
            x[i] = part_brick[:,i:i+self.past_window_len].transpose()
            # print('--')
            # print( data[feature_to_classify_offset:feature_to_classify_offset+feature_to_classify_size,i+max_len])
            y[i] = part_brick[feature_to_classify_offset:feature_to_classify_offset+feature_to_classify_size,i+self.past_window_len]
            # print(int(train_y[i]))

        
        y = np_utils.to_categorical(y, num_classes=self.n_classes, dtype="float32")

        return x, y


    #creates 1 batch of input for the bot model (shifted num_of_samples samples)
    def bot_input_batch(self, part_id):

        part_path = self.samples_path + os.sep + "part" + str(part_id) + os.sep + "part" + str(part_id) + ".npz"

        part_brick = np.load(part_path)
        part_brick = part_brick[part_brick.files[0]]

        #shift brick
        beat_offset = 0
        beat_size = 1
        melody_offset = 1
        melody_size = 1
        ch_info_offset = 2
        ch_info_size = 18

        part_brick = self.shift_beat_ch_info(part_brick, beat_offset, beat_size, ch_info_offset, ch_info_size)
        part_brick = self.shift_melody(part_brick, melody_offset, melody_size)

        # print(self.dim)
        x = np.empty((self.batch_size, *self.dim),dtype="float32")
        y = np.empty((self.batch_size, 1), dtype="float32")

        feature_to_classify_offset = 2
        feature_to_classify_size = 1

        # print("LALA")
        for i in range(0, self.batch_size, self.step_len):
            # Transpose the input examples in order to have time in 0 dimension and features in 1 dimension
            x[i] = part_brick[:,i:i+self.past_window_len].transpose()
            # print('--')
            # print( data[feature_to_classify_offset:feature_to_classify_offset+feature_to_classify_size,i+max_len])
            y[i] = part_brick[feature_to_classify_offset:feature_to_classify_offset+feature_to_classify_size,i+self.past_window_len]
            # print(int(train_y[i]))


        y = np_utils.to_categorical(y, num_classes=self.n_classes, dtype="float32")

        return x, y



#training
def train_model(args,version="parts"):


    ids_for_training, ids_for_validation = create_parts_list(args, args.validation_per)
    print(len(ids_for_training), len(ids_for_validation))
    # exit()
    
    if args.load is not "none":
        result = re.search('ep(.*)-acc', args.load)
        epochs_so_far = result.group(1)
    else:
        epochs_so_far = 0

    if args.model_type == "human20":
        args.class_num = 129
        feature_rows = 20
        if args.load is not "none":
            if "human20" in args.load:
                model = load_model(args.load)
            else:
                print("\nWRONG MODEL!!\n")
                exit()    
        else:
            model = my_models.model(args.past_window_len,feature_rows,args.class_num,args.units)

    elif args.model_type == "bot21":
        d_chord2int, d_int2chord = load_harmony_dictionaries()
        args.class_num = len(d_chord2int)
        feature_rows = 21

        if args.load is not "none":
            if "bot21" in args.load:
                model = load_model(args.load)
            else:
                print("\nWRONG MODEL!!\n")
                exit()

        else:
            model = my_models.model_bot(args.past_window_len,feature_rows,args.class_num,args.units)


    

    model_path = args.saved_models_folder + os.sep + version + "_model_"+args.model_type+"_"+str(args.past_window_len)+"len_ep{epoch:02d}-acc{val_acc:.4f}-loss{val_loss:.4f}-units"+str(args.units)+"_prevEp"+str(epochs_so_far)+".h5"
    
    print_callback = ModelCheckpoint(model_path, monitor='val_loss', save_best_only=True )
    
    tensorboard = TensorBoard(log_dir='logs/{}'.format(time.time()))
    #new log dir!!! 
    # /media/datadisk/imim/existential_crisis/latest_data/exp5/parts/

    training_generator = DataGenerator(ids_for_training, model_type=args.model_type, dim=(args.past_window_len, feature_rows), n_classes=args.class_num )
    validation_generator = DataGenerator(ids_for_validation, model_type=args.model_type, dim=(args.past_window_len, feature_rows), n_classes=args.class_num)

    # model.fit(train_x, train_y, epochs=args.epochs, batch_size=args.batch_size, shuffle=True, validation_data=(test_x, test_y),callbacks=[print_callback])
    model.fit_generator(training_generator, epochs=args.epochs, validation_data=validation_generator, callbacks=[print_callback,tensorboard], use_multiprocessing=True, workers=args.workers)

    # model.fit_generator(training_generator, epochs=args.epochs, validation_data=validation_generator, callbacks=[print_callback])


    return model


parser = argparse.ArgumentParser()
parser.add_argument("--model_type", type=str, default="seq", help="human20 / bot21")
parser.add_argument("--epochs",  type=int, default=10)
parser.add_argument("--batch_size",  type=int, default=128)
parser.add_argument("--past_window_len",  type=int, default=16)
parser.add_argument("--units",  type=int, default=64)
parser.add_argument("--class_num",  type=int, default=0)
parser.add_argument("--dropout_per",  type=int, default=0.3)
parser.add_argument("--saved_models_folder",  type=str, default="/media/datadisk/imim/existential_crisis/latest_data/exp5/parts")
parser.add_argument("--validation_per",  type=int, default=0.20)
parser.add_argument("--workers",  type=int, default=5)
parser.add_argument("--load",  type=str, default="none")

args = parser.parse_args()
print(args)

version = "parts"
folder_path = args.saved_models_folder

train_model(args,version)