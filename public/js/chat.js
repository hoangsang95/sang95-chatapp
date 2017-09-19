var socket = io();

socket.on('connect', function () {
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        }
        else {
            console.log('No error');
        }
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected from server.');
});

socket.on('joinAndLeave', function (message) {
    var li = jQuery('<li></li>').css({'padding': '10px', 'text-align': 'center', 'color': 'grey'});
    li.text(message);
    jQuery('#messages').append(li);
    if (!checkOnWindow()) {
        jQuery('#message-audio').get(0).play();
    }
});

socket.on('updateUserList', function (users) {
    var ol = jQuery('<ol></ol>');
    users.forEach(function (user) {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
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
    if (!checkOnWindow()) {
        jQuery('#message-audio').get(0).play();
    }
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
    if (!checkOnWindow()) {
        jQuery('#message-audio').get(0).play();
    }
    // var li = jQuery('<li></li>');
    // li.text(`${message.from} ${formattedTime} : `);
    // var a = jQuery('<a target="_blank">My current location</a>');
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
});

socket.on('user image', function (message, user) {
    var formattedTime = moment(message.createAt).locale('vi').format('HH:mm');
    var template = jQuery('#message-image-template').html();
    var html = Mustache.render(template, {
        from: user,
        text: message.imageData,
        createAt: formattedTime,

    });
    jQuery('#messages').append(html);
    scrollBottom();
    if (!checkOnWindow()) {
        jQuery('#message-audio').get(0).play();
    }
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

    var clientHeight = messages.prop('clientHeight'); // chieu cao man hinh co the thay
    var scrollTop = messages.prop('scrollTop'); // tra ve so pixel da scroll
    var scrollHeight = messages.prop('scrollHeight'); // tra ve toan bo height bao gom padding, khong tinh srollbar, margin
    var newMessageHeight = newMessage.innerHeight();

    if (clientHeight + scrollTop + newMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};

function checkOnWindow() {
    if (!document.hasFocus()) {
        return false;
    }
    return true;
}

