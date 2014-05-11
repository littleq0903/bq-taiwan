var lockSigninBtn, unlockSigninBtn;
lockSigninBtn = function(){
  $("#btn-signin").attr('disabled', true);
};
unlockSigninBtn = function(){
  $("#btn-signin").attr('disabled', false);
};