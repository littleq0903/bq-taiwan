
/*
 * functions to control sign in/out button.
 */
lock_signin_btn = function () {
    var $btn_signin = $("#btn-signin");
    $btn_signin.attr('disabled', true);
}
unlock_signin_btn = function () {
    var $btn_signin = $("#btn-signin");
    $btn_signin.attr('disabled', false);
}
