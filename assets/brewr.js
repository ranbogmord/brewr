var checkStatus = function () {
    $.get("/status", function (data) {
        var el = $(".status");

        if (el.text() !== data.status) {
            el.text(data.status);
            el.parent().attr("data-status", data.status);
        }
    });
}

jQuery(function ($) {
    setInterval(checkStatus, 2000);

    $("#brew-btn").click(function (e) {
        e.preventDefault();

        $.post("/brew", function (data) {
            alert(data.message);
        });
    });
});
