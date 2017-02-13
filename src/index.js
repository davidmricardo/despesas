//backbutton override

        


       var app = {
       // Application Constructor
       event:new Event("backPressed",{bubbles:true}),
            initialize: function() {
                this.bindEvents();
            },

            // Bind any events that are required on startup. Common events are:
            // 'load', 'deviceready', 'offline', and 'online'.
            bindEvents: function() {
               document.addEventListener('load', this.onLoad, false);
               document.addEventListener('deviceready', this.onDeviceReady, false);
            //   window.addEventListener("orientationchange", orientationChange, true);
               //document.addEventListener('backPressed', this.onBack, true);
            },
            onLoad: function() {
                //alert("loaded");
            },
            onBack:function()
            {
              //  alert("Já chega não!");
            },

           onDeviceReady: function() {
               document.addEventListener("backbutton", onBackKeyDown, false);
           }
       };

       function onBackKeyDown() {
           // alert("BACK WAS PRESSED");
            //var event; // The custom event that will be created
            //event = ;
            //event.eventName = "backPressed";

          document.dispatchEvent(app.event);

         //angular.element('[ng-controller=NavCtrl]').scope().back();
        }


       app.initialize();
    //\backbutton override
