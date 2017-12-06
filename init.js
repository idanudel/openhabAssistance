/**
 * Created by Idan on 26/08/2017.
 */
var app = require('express')();
var request = require('request');
var bodyParser = require('body-parser')

var items = [
    {names:["front garden light"],id:"FrontGardenLight",type:"light"},
    {names:["outside entrance light"],id:"OutsideEntranceLight",type:"light"},
    {names:["living room light"],id:"LivingRoomLight",type:"light"},
    {names:["dining room light"],id:"DiningRoomLight",type:"light"},
    {names:["kitchen spot light","kitchen spotlights","kitchen spotlight"],id:"KitchenSpotLight",type:"light"},
    {names:["living room spot light","living room spotlights","living room spotlight"],id:"LivingRoomSpotLight",type:"light"},
    {names:["kitchen light"],id:"KitchenLight",type:"light"},
    {names:["front entrance light"],id:"FrontEntranceLight",type:"light"},
    {names:["all lights","all light"],id:"AllLights",type:"light"},
    {names:["all home lights","all home light"],id:"HomeLights",type:"light"},
    {names:["kitchen shutter"], id:"KitchenShutter",type:"shutter"},
    {names:["living room shutter","lisdf"],id:"LivingRoomShutter",type:"shutter"},
    {names:["all shutter","all shutters"],id:"HomeRollershutters",type:"shutter"}
];
var localOpenhanUrl = "http://localhost:8080/rest/items/";
var commands = new Object(); // or var map = {};
commands["light"] = {onCommands:["turn on","open"],onCommand:"ON",offCommands:["turn off","close"],offCommand:"OFF",toggleCommand:"TOGGLE"};
commands["shutter"] = {onCommands:["turn on","open"],onCommand:"UP",offCommands:["turn off","close"],offCommand:"DOWN",setCommands:["set"],toggleCommand:"TOGGLE"};
commands["state"] = {onCommands:["state","status"]};


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
var listener = app.listen(82, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 82
});
app.get('/', function (req, res) {
    console.log("ss"+JSON.stringify(req.body));
    res.send('Hello World!')
})
app.post('/', function (req, res) {
    console.log("req: "+JSON.stringify(req.body));
    var qureyString = req.body.result.resolvedQuery;
    console.log("qureyString: "+qureyString);

    var command = "ON";

    var item = getItem(qureyString);
    if(!item){
        console.log("item not found");
        var resData = JSON.stringify(buildErrorRes());
        console.log("resData: "+resData);
        res.setHeader('Content-Type', 'application/json');
        res.send(resData);
        return;
    }
    console.log("item: "+JSON.stringify(item));

    var itemId= item.id;

    var command =  getCommand(qureyString,item.type)

    if(!command){
        console.log("command not found");
        var resData = JSON.stringify(buildErrorRes());
        console.log("resData: "+resData);
        res.setHeader('Content-Type', 'app lication/json');
        res.send(resData);
        return;
    }

    var options = {
        url: localOpenhanUrl+itemId,
        body: command
    }

    sendReq(options)
    var resData = JSON.stringify(buildRes(itemId + " to "+command));
    console.log("resData: "+resData);
    res.setHeader('Content-Type', 'application/json');
    res.send(resData);

})

function sendReq(options){
    options.headers= {
        'Content-Type':     "text/plain"
    }
    options.method = "POST";
    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log("body: "+body)
        }
        else{
            console.log("error: "+body)
        }
    })

}
function getItem(qurey){
    return items.find(function (item) {
        return item.names.some(function(v) { return qurey.indexOf(v) >= 0; })
    })

}
function getCommand(qurey,type){
    var commandsByType = commands[type];
    var onCommand = commandsByType.onCommands.some(function(v) { return qurey.indexOf(v) >= 0; })
    var offCommand = commandsByType.offCommands.some(function(v) { return qurey.indexOf(v) >= 0; })
    var setCommand;
    if(type == "shutter" && commandsByType.setCommands){
        setCommand= commandsByType.setCommands.some(function(v) { return qurey.indexOf(v) >= 0; })
        if(setCommand){
            var number = qurey.match(/\d+/)[0];
            if(number) return number;
        }
    }


    if((onCommand && offCommand)){
        return undefined
    }

    if(!onCommand && !offCommand){
        return commandsByType.toggleCommand;
    }

    if(onCommand) return commandsByType.onCommand;
    if(offCommand) return commandsByType.offCommand;



}




function buildRes(text){
    var data =  {
        speech: text,
        displayText: text,
        source : 'DuckDuckGo',
        "data": {
            "google": {
                "expect_user_response": false,
                "is_ssml": false,
                "no_input_prompts": []
            }
        }
    };
    return data;
}

function buildErrorRes(){
    var data =  {
        speech: 'Did not found what you look for, can you say it again?',
        displayText: 'Did not found what you look for, can you say it again?',
        source : 'DuckDuckGo'
    };
    return data;
}