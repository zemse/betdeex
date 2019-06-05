$(document).ready(function() {
    "use strict";

    //LEFT MOBILE MENU OPEN
    $(".mob-menu").on('click', function() {
        $(".menu").css('left', '0px');
        $(".mob-menu").fadeOut("fast");
        $(".mob-close").fadeIn("20000");
    });

    //LEFT MOBILE MENU CLOSE
    $(".mob-close").on('click', function() {
        $(".mob-close").hide("fast");
        $(".menu").css('left', '-92px');
        $(".mob-menu").show("slow");
    });

    //TICKET BOOKING FORM
    $('#b_form').on('submit', function(e) {
        var postdata = $(this).serializeArray();
        var formurl = $(this).attr("action");
        $.ajax({
            url: formurl,
            type: "POST",
            data: postdata,
            success: function(data) {
                var foo = $(".book-succ");
                foo.attr("style", "display: block;");
                $("#b_form").closest('form').find("input[type=text],input[type=tel],input[type=number],input[type=date],input[type=email], textarea").val("");
            }
        });
        e.preventDefault(); //STOP default action
        e.unbind(); //unbind. to stop multiple form submit.
    });

    //EVENT REGISTER FORM
    $('#er_form').on('submit', function(e) {
        var postdata = $(this).serializeArray();
        var formurl = $(this).attr("action");
        $.ajax({
            url: formurl,
            type: "POST",
            data: postdata,
            success: function(data) {
                var foo = $(".book-succ");
                foo.attr("style", "display: block;");
                $("#er_form").closest('form').find("input[type=text],input[type=tel],input[type=number],input[type=date],input[type=email], textarea").val("");
            }
        });
        e.preventDefault(); //STOP default action
        e.unbind(); //unbind. to stop multiple form submit.
    });

    //JOIN OUR CLUB FORM
    $('#j_form').on('submit', function(e) {
        var postdata = $(this).serializeArray();
        var formurl = $(this).attr("action");
        $.ajax({
            url: formurl,
            type: "POST",
            data: postdata,
            success: function(data) {
                var foo = $(".book-succ");
                foo.attr("style", "display: block;");
                $("#j_form").closest('form').find("input[type=text],input[type=tel],input[type=number],input[type=date],input[type=email], textarea").val("");
            }
        });
        e.preventDefault(); //STOP default action
        e.unbind(); //unbind. to stop multiple form submit.
    });

    //TEAM REGISTER FORM
    $('#tr_form').on('submit', function(e) {
        var postdata = $(this).serializeArray();
        var formurl = $(this).attr("action");
        $.ajax({
            url: formurl,
            type: "POST",
            data: postdata,
            success: function(data) {
                var foo = $(".book-succ");
                foo.attr("style", "display: block;");
                $("#tr_form").closest('form').find("input[type=text],input[type=tel],input[type=number],input[type=date],input[type=email], textarea").val("");
            }
        });
        e.preventDefault(); //STOP default action
        e.unbind(); //unbind. to stop multiple form submit.
    });

    //mega menu
    $(".tr-menu").hover(function() {
        $(".cat-menu").fadeIn(50);
    });
    $(".i-head-top").mouseleave(function() {
        $(".cat-menu").fadeOut("slow");
    });

    //PRE LOADING
    $('#status').fadeOut();
    $('#preloader').delay(350).fadeOut('slow');
    $('body').delay(350).css({
        'overflow': 'visible'
    });


});

//Slider
var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = slides.length
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
}