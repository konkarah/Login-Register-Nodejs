const messagetime = new Date('March 13, 08 04:20');

console.log(birthday.getHours());

var something = (function() {
    var executed = false;
    return function() {
        if (!executed) {
            executed = true;
            // do something
        }
    };
})();