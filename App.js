import React, {Component, useState, useEffect }from 'react';
import { Text, View, StyleSheet, Button, Dimensions, TextInput, Picker, ImageBackground, Touchable } from 'react-native';
import Constants from 'expo-constants';
import { LineChart } from "react-native-chart-kit";
import Svg, {Path} from 'react-native-svg';

 /***********************************
 * Author:  Adam Poper
 * Title:   Stock Market App Final Proj
 * Date:    November 19, 2020
 * Course:  cpsc 215, Dr. Zhou, Slippery Rock University
 * Summary: This app asks the user to enter a chosen stock market ticker
 *          to view the price history of the stock in either
 *          the last week, month, or 3 months
 ************************************/

// API used:   https://marketstack.com/
// example JSON response: http://api.marketstack.com/v1/eod?access_key=83abad7f7067a806fd5b23f3a04a939a&symbols=AAPL

export default function App() {
  // raw data as a JSON from the api
  const [stockData, setStockData]             = useState(0);
  // price history data to be plotted on th chart    
  const [prices, setPrices]                   = useState([]);   
  // current stock being evaluated. Represented as a ticker because that's how the api works
  const [ticker, setTicker]                   = useState('');   
  // the trading dates representing the time span of price history
  const [tradingDates, setTradingDates]       = useState([]);  
  // timeSpan is the selected value from the picker to determine what string to set currentTimeSpan
  const [timeSpan, setTimeSpan]               = useState('');
  // currentTimeSpan is the string version
  const [currentTimeSpan, setCurrentTimeSpan] = useState('');
  // from my experience separating the label and value part of the timespan picker into separate state variables helps to minimize issues
  return (
    // setting the chosen ticker and title of the chart
    <View style={styles.container}>
    <ImageBackground source={require("./assets/stockMinScale.jpg")}
      style={styles.bkimage}>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: "white"}}>Search Tickers: </Text>
        <TextInput style={styles.input} placeholder="ie: AAPL" onChangeText={tick=>setTicker(tick)}/>
      </View>      
      <Text style={styles.paragraph}>
        {ticker} Stock {currentTimeSpan}        
      </Text>
      <View>
         <LineChart
          data={{
            // the dates at the bottom of he chart so the user knows the time span the chart is refering to
            labels: tradingDates,   
            // the actual data points to be plotted                       
            datasets: [{ data: prices }]
          }}
          width={Dimensions.get('window').width} // from react-native
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16              
            }
          }}
          bezier
          style={{
            marginVertical: 0,
            borderRadius: 16,
            marginRight: 20,
            marginLeft: 10
          }}
          />
      </View>
      <Picker                
        selectedValue={timeSpan}
        onValueChange={(itemValue, itemIndex) =>{
           setTimeSpan(itemValue);   // current value of the picker
          }}>
          <Picker.Item color="white" label="Last Week" value="week"/>
          <Picker.Item color="white" label="Last Month" value="month"/>
          <Picker.Item color="white" label="Last 3 Months" value="3month"/>
      </Picker>
      <Button title="check" onPress={()=>{
        // url string from the api
        let str = "http://api.marketstack.com/v1/eod?access_key=83abad7f7067a806fd5b23f3a04a939a&symbols=";
        let url = str.concat(ticker); // concat the current ticker to make the actual url for the api
        fetch(url).then(response=>response.json()).then(data=>{setStockData(data); // fetch the data as a JSON
        let closes     = [];   // temporary array for the price history
        let dates      = [];   // temporary array for the time span
        let startIndex =  6;   // determines how far back in time to go represented as an array index
        let modIndex   =  1;   // limits the amount of date points to 7
        setCurrentTimeSpan("Last Week");  // initialize the current time span to the last week
        switch(timeSpan){
          case "week": 
            startIndex = 6;  // begin at the 6th index to get the last week of trading days
            setCurrentTimeSpan("Last Week");
            modIndex = 1;
            break;
          case "month":
            startIndex = 30;  // begin at the 30th index to get the last month of trading days
            setCurrentTimeSpan("Last Month");
            modIndex = 5;
            break;
          case "3month":
            startIndex = 90;  // begin at the 90th index to get the last 3 months of trading days
            modIndex = 15;
            setCurrentTimeSpan("Last 3 Months");
            break;         
        }
        // start at the determined startIndex and work through the data backwards to go back in time
        for(let i = startIndex; i >= 0; i--){
          closes.push(stockData.data[i].close);  // push back the close price for that trading day
          if(i % modIndex === 0)    // doing this limits the amount of dates shown on the chart to 7
            dates.push(parseDate(stockData.data[i].date));                   
        } 
        setPrices(closes);  // set the state for the prices array
        setTradingDates(dates);   // set the state for the tradingDates array 
        });
      }}/>
      </ImageBackground>

    </View>
  );
}
// parses the date from something like "2020-11-13T00:00:00+0000" to just "11-13"
function parseDate(date){
  let dateData = date.split('-');  
  let month = dateData[1];
  let day = dateData[2].charAt(0) + dateData[2].charAt(1);
  let finalDate = month + '-' + day;
  return finalDate;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 0,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "white"
  },
   input: {
    borderColor: "black", 
    fontSize: 18,
    width: 100, 
    height: 25,
    marginRight: 20,
    marginLeft: 10,
    color: "white"
  },
  bkimage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
});
