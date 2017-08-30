/*
$(".cd-popup").on('click', closePopup);
*/
$("#multipopup").on('click', '.cd-popup-close', closePopup);

function closePopup(event = null) {
    //$("#multipopup").removeClass('is-visible');
    if (event) {
        $(event.target).closest('.cd-popup-container').remove();
    } else {
        $('#multipopup').html('');
    }
    $(document).off('click', '#cd-buttons-no');
    $(document).off('click', '#cd-buttons-yes');
    _popupFree = true;
}

function popupFn(title, msg, joinContent, clBtn = true) {
    joinContent = joinContent || '';
    let closeBtn = clBtn ? "<div class='cd-popup-close'></div>" : '';
    let popupContent =
        "<div class='cd-popup-container'>" +
        "<h2>" + title + "</h2>" +
        "<p>" + msg + "</p>" +
        joinContent +
        closeBtn +
        "</div>";

    //$('#multipopup').html(popupContent) //.addClass('is-visible');
    $('#multipopup').prepend(popupContent);
}

function popupAlert(title, msg) {
    popupFn(title, msg);
}

function popupYesNo(title, msg, clBtn = true) {
    let jc = "<ul class='cd-buttons'>" +
        "<li><a id='cd-buttons-yes'>Yes</a></li>" +
        "<li><a id='cd-buttons-no'>No</a></li>" +
        "</ul>";
    popupFn(title, msg, jc, false);
}

function popupCall(title, msg, clBtn = false) {
    let jc = "<ul class='cd-buttons cd-buttons-icons'>" +
        "<li><a id='cd-buttons-yes'></a></li>" +
        "<li><a id='cd-buttons-no'></a></li>" +
        "</ul>";
    popupFn(title, msg, jc, false);
}

var _popupFree = true;

function popupBindButtons(fnOk, fnCancel, timer = 0) {
    if (_popupFree) {
        _popupFree = false;

        let _t = $('#multipopup').attr('data-popupid');
        _t = Number(_t) + 1;
        $('#multipopup').attr('data-popupid', _t);
        setTimeout(function () {
            if (_t == $('#multipopup').attr('data-popupid')) {
                ringtone.restart();
                closePopup();
            }
        }, 60000);

        $(document).on('click', '#cd-buttons-yes', function (e) {
            if (fnOk) {
                fnOk(e);
                $(document).off('click', '#cd-buttons-no');
                $(document).off('click', '#cd-buttons-yes');
                _popupFree = true;
            }
            closePopup(e);
        });
        $(document).on('click', '#cd-buttons-no', function (e) {
            if (fnCancel) {
                fnCancel(e);
                $(document).off('click', '#cd-buttons-no');
                $(document).off('click', '#cd-buttons-yes');
                _popupFree = true;
            }
            closePopup(e);
        });
    } else if (timer < 70) {
        setTimeout(function () {
            popupBindButtons(fnOk, fnCancel, timer + 1);
        }, 1000);
    }
}

function popupProfileSettings() {
    let popupContent =
        "<div class='cd-popup-container'>" +
        "<div class='cd-popup-close'></div>" +
        "<h2>Profile settings</h2>" +
        "<p>" + _ThisUserData.firstName + ' ' + _ThisUserData.lastName + "</p>" +
        "<div class='cd-form'>" +
        "<h3></h3>" +
        "<div>Change password</div>" +
        "<input id='oldPassword' type='password' placeholder='OLD PASSWORD'/>" +
        "<div>New password</div>" +
        "<input id='newPassword' type='password' placeholder='NEW PASSWORD'/>" +
        "<input id='confirmPassword' type='password' placeholder='CONFIRM NEW PASSWORD'/>" +
        "<button onclick='sendNewProfileData();'>SAVE</button>" +
        "</div>" +
        "</div>";

    //$('#multipopup').html(popupContent) //.addClass('is-visible');
    $('#multipopup').prepend(popupContent);

}