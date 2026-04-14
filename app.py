import numpy as np
import pandas as pd
import yfinance as yf
from keras.models import load_model
import streamlit as st
import matplotlib.pyplot as plt

def plot_chart(data, ma=None, title=''):
    fig = plt.figure(figsize=(12, 6))
    plt.plot(data.Close, 'g', label='Close Price')
    
    if ma is not None:
        plt.plot(ma, label='Moving Average')
    
    plt.title(title)
    plt.legend()
    return fig

model = load_model('Stock_Price_Predictor.keras')

st.header('Stock Price Predictor')

stock = st.text_input('Enter Stock Symbol', 'GOOG')
start = '2020-01-01'
end = '2025-12-31'

@st.cache_data
def load_data(stock):
        return yf.download(stock, start, end)
data = load_data(stock)

with st.spinner('Fetching stock data...'):
    data = yf.download(stock, start, end)

if data.empty:
    st.error("Invalid stock symbol. Please try again.")
    st.stop()

st.subheader('Stock Data')
st.write(data)

st.markdown('----')

data_train = pd.DataFrame(data.Close[0: int(len(data)*0.8)])
data_test = pd.DataFrame(data.Close[int(len(data)*0.8): int(len(data))])

from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler(feature_range=(0, 1))

pass_100_days = data_train.tail(100)
data_test = pd.concat([pass_100_days, data_test], ignore_index=True)
scaler.fit(data_train)
data_test_scaler = scaler.transform(data_test)

st.subheader('Price vs MA50')
st.pyplot(plot_chart(data, data.Close.rolling(50).mean(), 'MA50'))

st.subheader('Price vs MA100')
st.pyplot(plot_chart(data, data.Close.rolling(100).mean(), 'MA100'))

st.subheader('Price vs MA200')
st.pyplot(plot_chart(data, data.Close.rolling(200).mean(), 'MA200'))

x = []
y = []

for i in range(100, data_test_scaler.shape[0]):
    x.append(data_test_scaler[i-100:i])
    y.append(data_test_scaler[i, 0])

x_test, y_test = np.array(x), np.array(y)

predict = model.predict(x_test)

scale = 1/scaler.scale_

predict = predict * scale
y = y * scale

st.subheader('Original vs Predicted Prices')
fig4 = plt.figure(figsize=(12, 6))
plt.plot(y, 'g', label='Original Price')
plt.plot(predict, 'r', label='Predicted Price')
plt.xlabel('Time')
plt.ylabel('Price')
plt.legend()
st.pyplot(fig4)

last_100_days = data_test_scaler[-100:]
input_seq = last_100_days.reshape(1, -1, 1)

future_days = 7
future_predictions = []

for i in range(future_days):
    next_pred = model.predict(input_seq)

    future_predictions.append(next_pred[0][0])

    next_pred_reshaped = next_pred.reshape(1, 1, -1)
    input_seq = np.concatenate((input_seq[:,1:,:], next_pred_reshaped), axis=1)

future_predictions = np.array(future_predictions)
future_predictions = future_predictions.reshape(-1, 1)
future_predictions = scaler.inverse_transform(future_predictions)

st.subheader('Future Predictions for Next 7 Days')
last_date = data.index[-1]
future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=7)

st.subheader('Future Predictions for Next 7 Days')

for i, price in enumerate(future_predictions):
    st.write(f'Day {i+1}: ₹{price[0]:,.2f}')

future_df = pd.DataFrame({'Date': future_dates, 'Predicted Price': future_predictions.flatten()})
st.dataframe(future_df)

st.line_chart(future_df.set_index('Date'))

fig5 = plt.figure(figsize=(12, 6))
plt.plot(future_predictions, marker='o')
plt.title('Future Stock Price Predictions for Next 7 Days')
plt.xlabel('Day')
plt.ylabel('Predicted Price')
st.pyplot(fig5)