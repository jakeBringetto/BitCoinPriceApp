import numpy as np
import matplotlib.pyplot as plt 
import pandas as pd
import pandas_datareader as web
import datetime as dt

from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.layers import Dense, Dropout, LSTM 
from tensorflow.keras.models import Sequential 

from flask import Flask
from flask_cors import CORS, cross_origin
from json import dumps
from flask_jsonpify import jsonify



app = Flask(__name__)
CORS(app)

@app.route("/")
def predict():
    crpto_currency = 'BTC'
    fiat_currency = 'USD'

    start = dt.datetime(2016, 1, 1)
    end = dt.datetime(2020,1,1)

    curr_data = web.DataReader(f'{crpto_currency}-{fiat_currency}', 'yahoo', start, end)

    #process data
    post_scalar = MinMaxScaler(feature_range=(0,1))
    post_data = post_scalar.fit_transform(curr_data['Close'].values.reshape(-1,1))

    num_days = 60
    x_train, y_train = [], []

    for i in range(num_days, len(post_data)):
        x_train.append(post_data[i-num_days:i, 0])
        y_train.append(post_data[i, 0])

    x_train, y_train = np.array(x_train), np.array(y_train)
    x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

    model = Sequential()

    model.add(LSTM(units=50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50, return_sequences=True))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50))
    model.add(Dropout(0.2))
    model.add(Dense(units=1))

    model.compile(optimizer='adam', loss='mean_squared_error')
    model.fit(x_train, y_train, epochs=25, batch_size=32)


    test_start = dt.datetime(2020, 1, 1)
    end_test = dt.datetime.now()
    test_data = web.DataReader(f'{crpto_currency}-{fiat_currency}', 'yahoo', test_start, end_test)
    actual_prices = test_data['Close'].values

    total_dataset = pd.concat((curr_data['Close'], test_data['Close']), axis=0)

    model_inputs = total_dataset[len(total_dataset) - len(test_data) - num_days:].values
    model_inputs = model_inputs.reshape(-1,1)
    model_inputs = post_scalar.fit_transform(model_inputs)

    x_test = []

    for i in range(num_days, len(model_inputs)):
        x_test.append(model_inputs[i - num_days:i, 0])

    x_test = np.array(x_test)
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))

    prediction_prices = model.predict(x_test)
    prediction_prices = post_scalar.inverse_transform(prediction_prices)

    # plt.plot(actual_prices, color='black', label='Actual Prices')
    # plt.plot(prediction_prices, color='green', label='Prediction Prices')
    # plt.title(f'{crpto_currency} price prediction')
    # plt.xlabel('Time')
    # plt.ylabel('Price')
    # plt.show()

    real_data = [model_inputs[len(model_inputs) + 1 - num_days:len(model_inputs) + 1, 0]]
    real_data = np.array(real_data)
    real_data = np.reshape(real_data, (real_data.shape[0], real_data.shape[1], 1))

    final_prediction = model.predict(real_data)
    final_prediction = post_scalar.inverse_transform(final_prediction)
    print(final_prediction[0][0])
    return jsonify({'prediction' : str(final_prediction[0][0])})

if __name__ == '__main__':
    app.run()