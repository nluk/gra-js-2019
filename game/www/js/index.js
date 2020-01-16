/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var database;
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: async function () {
        await sleep(2000)
        console.log("Device ready called");
        var firebaseConfig = {
            apiKey: "AIzaSyAUt4aTdc0mzehHTJGMl5GNnWdATkTZz7c",
            authDomain: "froggercordova.firebaseapp.com",
            databaseURL: "https://froggercordova.firebaseio.com",
            projectId: "froggercordova",
            storageBucket: "froggercordova.appspot.com",
            messagingSenderId: "371798567601",
            appId: "1:371798567601:web:47d942fa2db5d312ba9090"
          };
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let game = new Game(width, height)
        game.run()
    }


};

app.initialize();