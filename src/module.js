(function (root, factory) {
	'use strict';
	if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		if (typeof angular === 'undefined') {
			factory(require('angular'));
		} else {
			factory(angular);
		}
		module.exports = 'ngDialog';
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(['angular'], factory);
	} else {
		// Global Variables
		factory(root.angular);
	}
}(this, function (angular) {
	'use strict';
	angular.module("notificationCenter", [

	]).provider("notification", function(){
		var getDeveloperNotifications,
			notificationsNumber,
			getDeveloperUnseenNotificationsNumber,
			seeNotifications,
			newNotification,
			setNotifications,
			showDesktopNotifications,
			permission = false,
			allNotificationsLoaded = false,
			notificationsOpen = false,
			loaded = false,
			unreadNotifications = {
				'value' : 0
			},
			noMoreNotificationsCallbacks = [],
			notifications = [],
			disabledNotifications = (localStorage.getItem('disabledNotifications') === "true"),
			desktopNotifications = (("Notification" in window) && Notification !== undefined && Notification.permission === "granted") ? true : false;
				
		var loading = {
			value: false,
			set: function(value){
				this.value = value;
				this.callbacks.forEach(function(callback){
					callback(value);
				});
			},
			get: function(){
				return this.value;
			},
			callbacks: [],
			addCallback: function(callback){
				this.callbacks.push(callback);
			}
		};
		
		this.loading = loading;
		
		setNotifications = function(notifications_){
			for(var index = 0; index < notifications_.length; index++){
				var notification = notifications_[index];
				notification.ready = notificationToString(notification);
				notifications.push(notification);
			}
			loading.set(false);
			loaded = true;
		};

		newNotification = function(notification, scope, $compile, ngToast, $sce){
			console.log(notification);
			++unreadNotifications.value;
			notification.ready = notificationToString(notification);
			notifications.unshift(notification);

			if(showDesktopNotifications){
				var template = angular.element("<div data-ng-include=\"'" + NCSigleNTemlpateURL + "'\"></div>");
				var scope_ = scope.$new();
				scope_.item = notification;
				$compile(template)(scope_);
				console.log(template);
				//var wtf = template.text().replace(/\s\s+/g, ' ');
				template = "OTVORI SI TABA CHE NE MOJEM DA PROGRAMIRAME";
				new spawnNotification("Ora", template, scope.clickNotification, disabledNotifications);
			}else{
				/*
				//notifications that is fake
				ngToast.create({
					className: 'notifi-cell',
					content: tmp.innerHTML
				});

				if(todoApp.user.getAttribute("notifications_sounds"))
					ngAudio.play("sound/notification.wav");
				*/
			}
		
		};

		notificationsNumber = function(number){
			unreadNotifications.value = number;
		}
		
		function noMoreNotifications(){
			allNotificationsLoaded = true;
			noMoreNotificationsCallbacks.forEach(function(callback){
				callback();
			});
		}
		

		this.setPermission = function(boolean){
			if(boolean === true && permission !== true){
				getDeveloperUnseenNotificationsNumber();
			}
			permission = boolean;
		};
		
		this.noMoreNotificationsAdd = function(callback){
			noMoreNotificationsCallbacks.push(callback);
		};
		
		this.getDeveloperNotifications = function(func){
			getDeveloperNotifications = func;
		};

		this.getDeveloperUnseenNotificationsNumber = function(func){
			getDeveloperUnseenNotificationsNumber = func;
		};
				
		this.seeNotifications = function(func){
			seeNotifications = func;
		};
		
		this.inlineNotification = function(yesorno){
			showDesktopNotifications = !yesorno;
		};
		
		this.$get = function(){
			//Let's get the first batch of notifications, this is being executed at angular.run();
			return {
				notifications: notifications,
				loaded : loaded,
				allNotificationsLoaded: function(){ //{1}
					return allNotificationsLoaded;
				},
				loadingTrue: function(){
					loading.set(true);					
				},
				loadMoreNotifications: function(){
					if(loading.get()){
						return;
					}
					loading.set(true);
					getDeveloperNotifications(notifications.length);
				},
				seeNotifications: function(){
					seeNotifications();
					for(var index = 0; index < notifications.length; index++){
						if(notifications[index].seen == "False")
							notifications[index].seen = "True";
					}
					unreadNotifications.value = 0;
				},
				noMoreNotificationsAdd: this.noMoreNotificationsAdd, //{2}
				inlineNotification: this.inlineNotification, //{2}
				setPermission: this.setPermission, //{2}
				newNotification: newNotification,
				setNotifications : setNotifications,
				notificationsNumber : notificationsNumber,
				noMoreNotifications: noMoreNotifications,
				loading: loading,
				unreadNotifications: unreadNotifications
			};
		};
	}).directive("notificationsCenter", ['notification', function(notification){
		return {
			restrict: "A",
			scope: false,
			link: function(scope, el, attrs){
				scope.noMoreNotifications = false;
				notification.noMoreNotificationsAdd(function(){
					scope.scrollMore = true;
					scope.noMoreNotifications = true;
					if (!scope.$$phase) scope.$apply();
				});
				scope.notifications = notification.notifications;
				scope.loadMoreNotifications = notification.loadMoreNotifications;
				scope.unreadNotifications = notification.unreadNotifications;
				scope.loaded = notification.loaded;

				scope.openIt = function(){
					notification.seeNotifications();
				};
			}
		};
	}]).directive("notificationCenterWrap", ['notification', function(notification){
		return {
			restrict: "A",
			templateUrl: NCTemplateURL,
			scope: false,
			link: function(scope, el,attrs){

			}
		};
	}]).directive("singleNotification", ['notification', function(notification){
		return {
			restrict: "A",
			templateUrl: NCSigleNTemlpateURL,
			scope: true
		};
	}]);
}));
/*

{1: Access to variable reference is only possible this way}
{2: Function accessible with provider and factory}

*/