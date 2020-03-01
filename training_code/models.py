import tensorflow as tf
from tensorflow.keras.callbacks import LambdaCallback, ModelCheckpoint
from tensorflow.keras.layers import InputLayer, Input, Dense, TimeDistributed, LSTM, RepeatVector, Dropout, GRU, CuDNNLSTM, Activation
from tensorflow.keras.models import Model, Sequential, load_model
from tensorflow.keras import regularizers
from tensorflow.keras.datasets import mnist
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import utils as np_utils

import math
from scipy.ndimage.interpolation import shift
import numpy as np
import matplotlib.pyplot as plt
import os
import sys
import pickle

import get_data as gd


#sequential model for input_dim = 1 (melody - p0)
def model_seq_input(max_len,feature_rows,class_num,units,dropout_per):

    # print(x_shape)
    model = Sequential()
    # model.add(CuDNNLSTM(units, input_shape=(max_len, feature_rows)))
    model.add(LSTM(units, input_shape=(max_len, feature_rows)))
    # model.add(Dropout(dropout_per))
    # model.add(CuDNNLSTM(units))
    model.add(Dropout(dropout_per))
    # model.add(CuDNNLSTM(256))
    # model.add(Dense(256))
    # model.add(Dropout(dropout_per))
    model.add(Dense(class_num))
    model.add(Activation('softmax'))
    # model.add(Activation('sigmoid'))

    optimizer = Adam(lr=0.0001)
    model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])
    # model.compile(loss='sparse_categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])

    model.summary

    return model


#model for input_dim > 1
def model(max_len,feature_rows,class_num,units):

    model = tf.keras.Sequential()

    # in_layer = InputLayer(input_shape=(max_len, feature_rows))
    # dense_layer = Dense(feature_rows, activation = "relu")
    # lstm_layer = CuDNNLSTM(units)
    # y_out = Dense(class_num, activation = "softmax")
    
    # model.add(in_layer)
    # model.add(dense_layer)
    # model.add(lstm_layer)
    # model.add(y_out)

    # in_layer = InputLayer(input_shape=(max_len, feature_rows))
    # model.add(Dense(feature_rows, kernel_initializer='glorot_normal', activation = "relu",input_shape=(max_len, feature_rows)))
    # model.add(CuDNNLSTM(units, kernel_initializer='glorot_normal'))
    # # model.add(LSTM(units))
    # model.add(Dense(class_num,  kernel_initializer='glorot_normal', activation = "softmax"))


    # in_layer = InputLayer(input_shape=(max_len, feature_rows))
    # model.add(Dense(feature_rows, kernel_initializer='he_normal', bias_initializer='he_normal', activation = "relu",input_shape=(max_len, feature_rows)))
    # model.add(CuDNNLSTM(units, kernel_initializer='he_normal', recurrent_initializer='he_normal', bias_initializer='he_normal', return_sequences=True))
    # model.add(CuDNNLSTM(units, kernel_initializer='he_normal', recurrent_initializer='he_normal', bias_initializer='he_normal'))
    # model.add(Dense(class_num, activation = "softmax"))


    

    model.add(Dense(feature_rows, activation = "relu",input_shape=(max_len, feature_rows)))
    # model.add(CuDNNLSTM(units, return_sequences=True))
    # model.add(CuDNNLSTM(units))
    model.add(LSTM(units))
    model.add(Dense(class_num, activation = "softmax"))

    optimizer = Adam(lr=0.0001)
    model.compile(optimizer = optimizer, loss = 'categorical_crossentropy', metrics=['accuracy'])

    model.summary

    return model


#model for input_dim > 1
def model_bot(past_window_size,feature_rows,class_num,units):
    # print("\nSIMPLE LSTM BOT "+str(units)+"\n")
    model = tf.keras.Sequential()

    # in_layer = InputLayer(input_shape=(max_len, feature_rows))
    model.add(Dense(feature_rows, activation = "relu",input_shape=(past_window_size, feature_rows)))
    # model.add(CuDNNLSTM(units))
    model.add(LSTM(units))
    model.add(Dense(class_num, activation = "softmax"))

    # optimizer = Adam(lr=0.0001)
    # model.compile(optimizer = optimizer, loss = 'categorical_crossentropy', metrics=['accuracy'])

    # model.add(Dense(feature_rows, kernel_initializer='he_normal', bias_initializer='he_normal', activation = "relu",input_shape=(past_window_size, feature_rows)))
    # model.add(CuDNNLSTM(units, kernel_initializer='he_normal', recurrent_initializer='he_normal', bias_initializer='he_normal', return_sequences=True))
    # model.add(CuDNNLSTM(units, kernel_initializer='he_normal', recurrent_initializer='he_normal', bias_initializer='he_normal'))
    # model.add(Dense(class_num, kernel_initializer='he_normal', bias_initializer='he_normal', activation = "softmax"))

    # model.add(LSTM(units))
    
    optimizer = Adam(lr=0.0001)
    model.compile(optimizer = optimizer, loss = 'categorical_crossentropy', metrics=['accuracy'])



    model.summary

    return model



#model for input_dim > 1
def model_testin(past_window_size,feature_rows,class_num,units):

    model = tf.keras.Sequential()

    # in_layer = InputLayer(input_shape=(max_len, feature_rows))
    model.add(Dense(feature_rows, activation = "relu",input_shape=(past_window_size, feature_rows)))
    # model.add(CuDNNLSTM(units))
    model.add(LSTM(units))
    #dropout()
    #lstm
    model.add(Dense(class_num, activation = "softmax"))

    optimizer = Adam(lr=0.0001)
    model.compile(optimizer = optimizer, loss = 'categorical_crossentropy', metrics=['accuracy'])

    model.summary

    return model


