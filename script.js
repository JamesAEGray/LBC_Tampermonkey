// ==UserScript==
// @name         LocalBitcoins Margin Calculator (For CAD)
// @namespace    https://localbitcoins.com/*
// @version      0.1
// @description  Put markup percentages based on bitstamp & bank of canada
// @author       You
// @match        https://localbitcoins.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Define our APIs
    var btc_rates_api = 'https://www.bitstamp.net/api/ticker_hour/';
    var boc_rates_api = 'https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/json'; //https://www.bankofcanada.ca/valet/observations/FXUSDCAD?start_date='+today+'&end_date='+today;//2019-06-07';


    //Call APIs to recieve rates. Not that it fucking matters as the Async requires us to set a localStorage variable...
    var btc_rates = httpGetAsync_bitstamp(btc_rates_api);
    var boc_rates = httpGetAsync_boc(boc_rates_api);
    console.log("Boc rates:" + boc_rates);

    //Get rates from previously set localStorage varibables and calculate the latest rate in CAD
    var btc_rate_last = localStorage.getItem('btc_rate_last');
    var boc_rate_last = localStorage.getItem('boc_rate_last')
    var cad_rate_last = (btc_rate_last * boc_rate_last).toFixed(2);

    //Get Posted prices on all the ads
    var prices = document.getElementsByClassName('column-price');
    var count = 0; //Set a counter to
    var margin = 0; //Declare and set later

    //Loop through all the posted prices adding in the margin
    for (var price_string in prices){
        var posted_price = parseFloat(prices.item(count).innerText.substring(0, prices.item(count).innerText.length - 4).replace(/,/g, ''));

        margin = posted_price / cad_rate_last;
        console.log(posted_price + '/' + cad_rate_last + '=' + margin);
        margin = ((margin - 1)*100).toFixed(2);

        var percent_sign = '+%';
        if(margin < 0){
            percent_sign = '-%';
        }
        prices.item(count).innerHTML = prices.item(count).innerHTML + " " + percent_sign + Math.abs(margin);
        count++;
    }

    //API call for the Bitstamp Rate
    function httpGetAsync_bitstamp(theUrls){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                btc_rates = JSON.parse(xmlHttp.responseText);
                if(typeof btc_rates !== "undefined"){
                    //console.log(btc_rates.last);
                    btc_rates = btc_rates.last
                }
            }
            if(typeof btc_rates !== "undefined"){

                localStorage.setItem('btc_rate_last', btc_rates);
            }

        }
        xmlHttp.open("GET", theUrls, true); // true for asynchronous
        xmlHttp.send(null);
    }//End of httpGetAsync_bitstamp


    //API call for the Bank of Canada Rate
    function httpGetAsync_boc(theUrls){
        var url ='';
        var count = 0;

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                boc_rates = JSON.parse(xmlHttp.responseText);

                var todays_rate = boc_rates.observations.length - 1;
                var fx_rate = boc_rates.observations[todays_rate].FXUSDCAD.v;

                localStorage.setItem('boc_rate_last', fx_rate);
            }
        }

        xmlHttp.open("GET", theUrls, true); // true for asynchronous
        xmlHttp.send(null);
    }//End of httpGetAsync_boc


})();
