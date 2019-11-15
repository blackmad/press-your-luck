$(function(){

  var colorArray = [
    {value: 470,   text: "470",    free_spin: "0", img: "choice1.png", pos: "0px 0px"},
    {value: 750,   text: "750",    free_spin: "0", img: "choice2.png", pos: "0px 0px"},
    {value: 1750,  text: "1750",   free_spin: "0", img: "choice3.png", pos: "0px 0px"},
  ];

  //buttons
  var input = document.getElementById("input");
  var score = 0;
  var spins = 2;
  var arraySelection;
  var $rows = [];
  var chosenCel;
  var whammyCount = 0;

  // decelerating to zero velocity 
  function easeOutQuart (t) { return 1-(--t)*t*t*t }
  let animationStartTime = 0;
  const animationTimeInMs = 3000;

  // console.log(colorArray[Math.floor(Math.random()*colorArray.length)]);

  function blink(){
    const currentTime = new Date().getTime();
    // console.log('currentTime', currentTime);
    const elapsedTime = currentTime - animationStartTime;
    // console.log('elapsedTime', elapsedTime);
    const scaledT = elapsedTime / animationTimeInMs;
    // console.log('scaledT', scaledT);
    // console.log(easeOutQuart(scaledT));

    $rows = $('.cel');
    $rows.removeClass('flash').removeAttr("style").html("");

    $rows.each(function(){
      arraySelection = colorArray[Math.floor(Math.random()*colorArray.length)];
      // console.log(arraySelection);

        if (arraySelection.value == -1) {
          $(this).css("background-image", "url(img/" + arraySelection.img + ")")
            .attr('value', arraySelection.value)
            .attr('free_spin', arraySelection.free_spin);
        } else {
          $(this).css("background-image", "url(img/" + arraySelection.img + ")")
            // .css('background-position', arraySelection.pos)
            // .css('background-size', "800px 600px")
            .attr('value', arraySelection.value)
            .attr('free_spin', arraySelection.free_spin);
        }
     });

    chosenCel = $rows[Math.floor(Math.random()*$rows.length)];
    $(chosenCel).addClass('flash');  
    console.log($(chosenCel));
  };

  function start() {
    // event.stopPropagation();
    $(chosenCel).removeClass('flash');
    clearTimeout(flash);
    animationStartTime = new Date().getTime();
    add = setInterval(blink,500);
    $('#spins').html('<p>Spins: ' + spins + '</p>');
  }

  function checkFreeSpin(){
    clickedCel = chosenCel.attributes.value.value;

    if (clickedCel == -1){
      score = 0;
      spins -= 1;
      addWhammys();    
    } else if (chosenCel.attributes.free_spin.value == 1) {
      score += parseInt(clickedCel);
      spins += 1;
      // console.log(chosenCel.attributes.value.data-free-spin);
    } else {
      score += parseInt(clickedCel);
    };  
  }

  function addWhammys(){
    $('.whammyPic').eq(whammyCount).css('background-image', "url(img/whammy2.png)");
    
    if (whammyCount == 2){
      $('#celMiddle').html("<p>GAME OVER. CLICK BELOW To RESTART</p>");
      console.log("line 99 game over! whammy count: " + whammyCount);
      $('#start').text('RESTART').on('click', reset());
    } else {
      whammyCount++; 
      console.log("line 101 whamy count: " + whammyCount);
    }
  }

  function stop(){
    // event.stopPropagation();
    clearInterval(add);
    checkFreeSpin();  

    $('#score').text("$ " + score);
    flash(chosenCel, 5, 100);
  }

  function flash(elem, times, speed) {
      if (times > 0 || times < 0) {
          if ($(elem).hasClass("flash")) 
              $(elem).removeClass("flash");
          else
              $(elem).addClass("flash");
      }

      clearTimeout(function () {
          flash(elem, times, speed);
      });

      if (times > 0 || times < 0) {
          setTimeout(function () {
              flash(elem, times, speed);
          }, speed);
          times -= .5;
      }
  }

  function reset(){
    score = 0;
    spins = 2;
    $rows = [];
    whammyCount = 0;
  }


  $('#target').on('click',function(){
    if($(this).attr('data-click-state') == 1) {
      $(this).attr('data-click-state', 0)
      stop(event);
    } else {
      $(this).attr('data-click-state', 1)
      start(event);
    }    
  });

});
