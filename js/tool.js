$('.features .tools li[data-tool=message]').addClass('tool-active');

$('.features .tools li').mousedown(function () {
    if ($(this).hasClass('tool-active')) {
        return false;
    } else {
        $('.features .tools li').removeClass('tool-active');
        $(this).addClass('tool-active');
    }
});