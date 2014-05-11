var lockSigninBtn, unlockSigninBtn, out$ = typeof exports != 'undefined' && exports || this;
lockSigninBtn = function(){
  $("#btn-signin").attr('disabled', true);
};
unlockSigninBtn = function(){
  $("#btn-signin").attr('disabled', false);
};
out$.switchPage = switchPage;
function switchPage(pageName){
  var inOptions, pageClassName;
  inOptions = {
    queue: true,
    duration: 500
  };
  pageClassName = "." + pageName;
  console.log(pageClassName);
  $('.page').addClass('hide');
  $(pageClassName).fadeIn(inOptions).removeClass('hide');
  if (pageName === 'page-data') {
    updateDataView();
  }
}