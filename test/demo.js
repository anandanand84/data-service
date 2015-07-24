var body = document.getElementsByTagName('body');


var users = [];

for(var i=0;i<1;i++){
  users.push(new DataService());
}

var id;

users.forEach(function(user){
  user.id = setInterval(function(){
    var data = {};
    data.interval = 86400;
    data.requiredBars = 500;
    data.scrip = 'RELIANCE';
    data.registrationId = "";
    var startTime = new Date();
    user.getChartData(data).then(function (resp) {
      console.log("Total Time take is "+((new Date()).getTime() - startTime.getTime())/1000 );
      document.write("Total Time take is "+((new Date()).getTime() - startTime.getTime())/1000 );
    }, function (error) {
      console.error(error);
    });
  },500);
})
