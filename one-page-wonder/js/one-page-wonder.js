$(document).ready(function(){
  /* smooth-scroll */
  $("ul.navbar-nav a").smoothScroll({
    offset: 30,
    afterScroll: function () {
      $('ul.navbar-nav ul a').removeClass('active');
      $(this).addClass('active');
    }
  });
});
