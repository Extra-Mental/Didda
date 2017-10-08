function rotate(elementID) {

  var $rota = $(elementID),
    degree = 0,
    timer;

  function spin() {
    $rota.css({
      transform: 'rotate(' + degree + 'deg)'
    });
    plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    randAngle = Math.floor(Math.random() * 90) * plusOrMinus;
    randDelay = Math.floor(Math.random() * 1000 * 5);
    timer = setTimeout(function() {
      degree += randAngle;
      spin(); // loop it
    }, randDelay);
  }

  spin(); // run it!

};

rotate('#diamond1');
rotate('#diamond2');
rotate('#diamond3');
