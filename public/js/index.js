var socket = io();

socket.on('connect', function () {
    console.log('User connect to server.');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server.');
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createAt).locale('vi').format('HH:mm');
    var str = message.text.split(" ");
    var arrResult = [];
    var checkLink = false;
    for (var i = 0; i < str.length; i++) {
        if (validUrl(str[i])) {
            str[i] = `<a target="_blank" href="${str[i]}">${str[i]}</a>`;
        }
        arrResult.push(str[i]);
    };
    arrResult.forEach(item => {
        if (validUrl(item)) {
            return checkLink = true;
        }
    });
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        text: arrResult.join(' '),
        createAt: formattedTime,
        checkLink
    });
    jQuery('#messages').append(html);
    scrollBottom();
    // var li = jQuery('<li></li>');
    // var str = message.text.split(" ");
    // var arrResult = [];
    // for (var i = 0; i < str.length; i++) {
    //     if (validUrl(str[i])) {
    //         str[i] = `<a target="_blank" href="${str[i]}">${str[i]}</a>`;
    //     }
    //     arrResult.push(str[i]);
    // };
    // arrResult.forEach(item => {
    //     if (validUrl(item)) {
    //         return li.html(`${message.from} ${formattedTime} : ` + arrResult.join(' '));
    //     }
    //     li.text(`${message.from} ${formattedTime}: ` + arrResult.join(' '));
    // });
    // jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createAt).locale('vi').format('HH:mm');
    var template = jQuery('#message-location-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollBottom();
    // var li = jQuery('<li></li>');
    // li.text(`${message.from} ${formattedTime} : `);
    // var a = jQuery('<a target="_blank">My current location</a>');
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
});

socket.on('user image', function (message) {
    var formattedTime = moment(message.createAt).locale('vi').format('HH:mm');
    var template = jQuery('#message-image-template').html();
    var html = Mustache.render(template, {
        from: 'User',
        text: message.imageData,
        createAt: formattedTime,

    });
    jQuery('#messages').append(html);
    scrollBottom();
    // var li = jQuery('<li></li>');
    // var p = jQuery('<p></p>');
    // li.text(`User ${formattedTime} : `).append('<br><br>');
    // var img = jQuery('<img/>');
    // img.attr('src', message.imageData);
    // li.append(img);
    // jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    var messageInput = jQuery('[name=message]');
    if (messageInput.val().length === 0) {
        return false;
    }
    socket.emit('createMessage', {
        from: 'User',
        text: messageInput.val(),
    }, function () {
        messageInput.val('');
        messageInput.focus();
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation IS NOT available');
    }

    locationButton.attr('disabled', 'disabled').text('Sending Location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send Location');
        if (position.coords.accuracy > 50) {
            return alert('Unable fetch your location');
        }
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
    },
        function (err) {
            console.log(err);
            alert('Unable fetch your location');
            locationButton.removeAttr('disabled').text('Send Location');
        }
    );
});

jQuery('#imageFile').on('change', function (e) {
    var file = e.originalEvent.target.files[0];
    var reader = new FileReader();
    console.log(file);
    reader.onload = function (evt) {
        var jsonObject = {
            'imageData': evt.target.result
        }

        // send a custom socket message to server
        socket.emit('user image', jsonObject);
    };

    reader.readAsDataURL(file);
     $(this).val("");
});

jQuery('#send-image').on('click', function () {
    jQuery('#imageFile').click();
});

function validUrl(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
};

function scrollBottom() {
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};

