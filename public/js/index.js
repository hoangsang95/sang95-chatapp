var socket = io();

socket.on('connect', function () {
    console.log('User connect to server.');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server.');
});

socket.on('newMessage', function (message) {
    console.log('newMessage', message);
    var li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);
    jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function (message) {
    var li = jQuery('<li></li>');
    li.text(`${message.from}: `);
    var a = jQuery('<a target="_blank">My current location</a>');
    a.attr('href', message.url);
    li.append(a);
    jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val(),
    }, function (data) {
        console.log('Got it', data);
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation IS NOT available');
    }
    navigator.geolocation.getCurrentPosition(function (position) {
        if(position.coords.accuracy > 50){
            return alert('Unable fetch your location');
        }
        console.log(position);
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
    }, 
    function (err) {
        console.log(err);
        alert('Unable fetch your location');
    }, 
    {
        timeout: 5000,
        enableHighAccuracy: true,
        maximumAge: Infinity
    });
})

