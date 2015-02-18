var sPop,
    delay,
    save,
    pt = null,
    app = chrome.extension.getBackgroundPage(),oldPass,newPass;

$(document).ready(restore_options);



function restore_options() {
    if(app.auth && !!localStorage.agent){
        $("#userName").html(app.Base64.decode(localStorage.agent));
        $("#changePass").show();

        oldPass = $("#oldPass");
        newPass = $("#newPass");
    }

    var pop = localStorage["showPopups"] == 'false') ? false : true,
        del = localStorage["delay"];

    sPop = $('#popup');
    delay = $('#disapear');
    save = $('#save');

    save.on('click',save_options);

    sPop.attr('checked', typeof pop == 'boolean' ? pop : true);
    delay.val(del ? del/1000 : 4);
}



function save_options() {
    _sPop = sPop.attr('checked');
    _delay = delay.val() * 1000;

    localStorage["showPopups"] = _sPop;
    localStorage["delay"] = _delay;

    var passText = "";

    if(!!oldPass.val() && !!newPass.val()){
        app.socket.emit("changePass",{oldP:oldPass.val(),newP:newPass.val()});
        passText = " <strong id='passText'>Please wait for the confirmation of success password changed.</strong>";
        pt = $("#passText");
    }

    var status = $("#status");
    status.html("Options Saved."+passText);
    setTimeout(function() {
        status.html("");
    }, 750);
}

app.socket.on('successChangePass',function(){
    if(!!pt)
        pt.text("Your password has been changed!");
});

app.socket.on('errorChangePass',function(err){
    if(!!pt)
        pt.text("There's an error in the process, Make sure you are connected or ask to your administrator.");
});

app.socket.on('invalidOldPass',function(){
    if(!!pt)
        pt.text("Your old password is incorrect.");
})