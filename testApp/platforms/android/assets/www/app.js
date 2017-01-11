$(document).ready(function() {

app.showStartView();
$('.ipField').hide()
//app.showControlView()
	$('#connectButton').click(function() {
		app.connect()
	})

	$('#disconnectButton').click(function() {
		app.disconnect()
	})

	var IS_ON = false;
	$('#led').click(function(){
		if(!IS_ON){
			app.ledOn(true);
			IS_ON = true;
		}
		else {
			app.ledOff(true);
			IS_ON = false;
		}
	})

	$('#tempButton').click(function() {
		app.sendTemp($('#tempValue').val())
		app.changeTargetTempOnView($('#tempValue').val())
		app.showControlView()
	})

	$('.targetTemp').click(function() {
		app.showTeperatureView();
	})

	$('.currentTemp').click(function() {
		app.sendString("U");
	})

	$('#65degBtn').click(function() {
			app.sendTemp(65)
			app.changeTargetTempOnView(65)
			app.showControlView()
	})
	$('#75degBtn').click(function() {
			app.sendTemp(75)
			app.changeTargetTempOnView(75);
			app.showControlView()
	})
	$('#85degBtn').click(function() {
			app.sendTemp(85)
			app.changeTargetTempOnView(85)
			app.showControlView()
	})
	$('#100degBtn').click(function() {
			app.sendTemp(100)
			app.changeTargetTempOnView(100)
			app.showControlView()
	})

	$('#back').click(function() {
		app.showControlView()
	})

	$('#wakeUpBtn').click(function() {
		app.showWakeUpView();
		app.sendString("T");
	})

	$('#wakeUpTime').click(function() {
		app.sendString("T");
	})

	$('#time').bootstrapMaterialDatePicker ({
		date: false,
		shortTime: false,
		format: 'HH:mm'
	})

	$('#timeButton').click(function() {
		app.sendTime($('#time').val())
		app.showControlView()
	})

	$('.cupsCapacity').click(function() {
		app.sendString("C");
	})
})

var app = {}

app.PORT = 1337
app.socketId

app.connect = function() {
	app.showStartView();
	var IPAddress = $('#IPAddress').val()

	console.log('Trying to connect to ' + IPAddress)

	$('#startView').hide()
	//$('#connectingStatus').text('Connecting to ' + IPAddress)
	$('#connectingStatus').text('Connecting to artKettle')
	$('#connectingView').show()

	chrome.sockets.tcp.create(function(createInfo) {

		app.socketId = createInfo.socketId

		chrome.sockets.tcp.connect(
			app.socketId,
			IPAddress,
			app.PORT,
			connectedCallback)
	})

	function connectedCallback(result) {

		if (result === 0) {

			console.log('Connected to ' + IPAddress)
			chrome.sockets.tcp.onReceive.addListener(onReceive);
			app.sendString('U');
			delay(200);
			app.sendString('С');
			delay(200);
			app.showControlView();
		}
		else {

			var errorMessage = 'Failed to connect to ' + app.IPAdress
			console.log(errorMessage)
			navigator.notification.alert(errorMessage, function() {})
			app.showStartView();
		}
	}
}

var numb = 0;
function onReceive(info) {
	var buf = ab2str(info.data);
	console.log(buf);
	if (buf.substr(0, 4) == "temp") {
		numb = buf.match(/\d/g);
		numb = numb.join("");
		console.log(numb);
		app.changeCurrentTempOnView(numb)
	}
	if (buf.substr(0, 5) == "READY") {
		//app.ledOff(false)
		app.setButtonOff();
		navigator.notification.beep(1);
		navigator.notification.alert("Ready!!!");
	}
	if (buf.substr(0, 3) == "OFF") {
			//app.ledOff(false)
			app.setButtonOff();
		}
	if (buf.substr(0, 2) == "ON") {
		//app.ledOn(false)
		app.setButtonOn();
	}
	if (buf.substr(0, 5) == "time=") {
		$( ".timeParagraph").text(buf.substr(5));
	}
	if (buf.substr(0,5) == "cups=") {
		if(buf.substr(5) == "0"){
			navigator.notification.vibrate(500);
			navigator.notification.alert("Water level is very low!!!");
		}
		$( ".cupsCapacity" ).text(buf.substr(5));
	}
	if (buf.substr(0, 5) == "READY") {
		//app.ledOff(false)
		app.setButtonOff();
	}
}

	function ab2str(ab) {
	    var dataView = new DataView(ab);
	    var decoder = new TextDecoder('utf-8');
	    return decoder.decode(dataView);
	}

app.showControlView = function() {
	$('#controlView').show("slide", { direction: "left" }, 300)
	$('#temperatureView').hide()
	$('#back').hide()
	$('#startView').hide()
	$('#connectingView').hide()
	$('#wakeUpView').hide()
	$('#disconnectButton').show()
}

app.showTeperatureView = function() {
	$('#startView').hide()
	$('#connectingView').hide()
	$('#controlView').hide("slide", { direction: "left" }, 300)
	$('#temperatureView').show()
	$('#back').show()
	$('#wakeUpView').hide()
	$('#disconnectButton').show()
}

app.showConnectingView = function() {
	$('#startView').hide()
	$('#connectingView').show()
	$('#controlView').hide()
	$('#temperatureView').hide()
	$('#back').hide()
	$('#wakeUpView').hide()
}

app.showStartView = function() {
	$('#startView').show("slide", { direction: "right" }, 300)
	$('#controlView').hide()
	$('#connectingView').hide()
	$('#temperatureView').hide()
	$('#back').hide()
	$('#wakeUpView').hide()
	$('#disconnectButton').hide()
}
app.showWakeUpView = function() {
	$('#startView').hide()
	$('#wakeUpView').show()
	$('#controlView').hide("slide", { direction: "left" }, 300)
	$('#temperatureView').hide()
	$('#back').show()
	$('#disconnectButton').show()
}

app.changeTargetTempOnView = function(newTemp) {
	$( ".targetTemp" ).text(newTemp+String.fromCharCode(176));
	app.changeTempColor(newTemp, ".targetTemp")
}

app.changeCurrentTempOnView = function(newTemp) {
	$( ".currentTemp" ).text(newTemp+String.fromCharCode(176));
	app.changeTempColor(newTemp, ".currentTemp")
}

app.changeTempColor = function(newTemp, tempClass) {
	if(newTemp < 75 )
	{
		$( tempClass).addClass("amber")
		$( tempClass ).removeClass("orange")
		$( tempClass ).removeClass("deepOrange")
		$( tempClass ).removeClass("red2")
	}
	else if(newTemp >= 75 && newTemp < 85 )
	{
		$( tempClass).addClass("orange")
		$( tempClass ).removeClass("amber")
		$( tempClass ).removeClass("deepOrange")
		$( tempClass ).removeClass("red2")
	}
	else if(newTemp >= 85 && newTemp < 95 )
	{
		$( tempClass ).addClass("deepOrange")
		$( tempClass ).removeClass("amber")
		$( tempClass ).removeClass("orange")
		$( tempClass ).removeClass("red2")
	}
	else if(newTemp >= 95)
	{
		$( tempClass ).addClass("red2")
		$( tempClass ).removeClass("amber")
		$( tempClass ).removeClass("orange")
		$( tempClass ).removeClass("deepOrange")
	}
}

app.sendString = function(sendString) {

	console.log('Trying to send:' + sendString)

	chrome.sockets.tcp.send (
		app.socketId,
		app.stringToBuffer(sendString),
		function(sendInfo) {

			if (sendInfo.resultCode < 0) {

				var errorMessage = 'Failed to send data'

				console.log(errorMessage)
				navigator.notification.alert(errorMessage, function() {})
			}
		}
	)
}

app.ledOn = function(send) {
	send = typeof send !== 'undefined' ? send : true;
	if(send)
	{
		app.sendString('H');
		app.sendString('U');
	}

	//setButtonOn();
}

app.ledOff = function(send) {
	send = typeof send !== 'undefined' ? send : true;
	if(send)
	{
		app.sendString('L');
		app.sendString('U');
	}

//	setButtonOff();
}

app.setButtonOn = function() {
	$('#led').removeClass('ledOff').addClass('ledOn')

	$('#led').unbind('click').click(function(){
		app.ledOff()
	})
}

app.setButtonOff = function()  {
	$('#led').removeClass('ledOn').addClass('ledOff')

	$('#led').unbind('click').click(function(){
		app.ledOn()
	})
}
app.disconnect = function() {

	chrome.sockets.tcp.close(app.socketId, function() {
		console.log('TCP Socket close finished.')
	})
	chrome.sockets.tcp.onReceive.removeListener(onReceive);

	app.showStartView();
	app.setButtonOff();
}

app.sendTemp = function(targTemp) {
		app.sendString("temp="+targTemp.toString());
}

app.sendTime = function(wakeUpTime) {
		app.sendString("time="+wakeUpTime.toString());
}
// Helper functions.

app.stringToBuffer = function(string) {

	var buffer = new ArrayBuffer(string.length)
	var bufferView = new Uint8Array(buffer)

	for (var i = 0; i < string.length; ++i) {

		bufferView[i] = string.charCodeAt(i)
	}

	return buffer
}

app.bufferToString = function(buffer) {

	return String.fromCharCode.apply(null, new Uint8Array(buffer))
}

function delay(ms) {
   ms += new Date().getTime();
   while (new Date() < ms){}
}
