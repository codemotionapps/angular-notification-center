import angular from "angular";

	angular.module("notificationCenter", [

	]).provider("notification", function(){
		var getDeveloperNotifications,
			notificationsNumber,
			getDeveloperUnseenNotificationsNumber,
			seeNotifications,
			newNotification,
			setNotifications,
			showDesktopNotifications,
			stringifier,
			permission = false,
			allNotificationsLoaded = false,
			notificationsOpen = false,
			loaded = false,
			unreadNotifications = {
				'value' : 0
			},
			noMoreNotificationsCallbacks = [],
			notifications = [],
			disabledNotifications = (localStorage !== undefined ? localStorage.getItem('disabledNotifications') === "true" : true), //Private browsing in Safari
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
				notification.ready = stringifier(notification);
				if(notifications.length == 0 || notifications[0].time != notification.time)
					notifications.push(notification);
			}
			if(notifications_.length < 10)
				noMoreNotifications();
			loading.set(false);
			loaded = true;
		};

		newNotification = function(notification, scope, $compile, ngToast, $templateCache){
			++unreadNotifications.value;
			notification.ready = stringifier(notification);
			notifications.unshift(notification);

			if(allNotificationsLoaded)
				noMoreNotifications();

			if(showDesktopNotifications){
				var scope_ = scope.$new();
				scope_.item = notification;
				var template = angular.element("<div></div>");
				template.html($templateCache.get(NCSigleNTemlpateURL));
				template = $compile(template)(scope_);
				setTimeout(function(){
					template = template.text().trim();	
					template = template.replace(/\s\s+/g, ' ');
					new spawnNotification("Ora", template, scope.clickNotification, disabledNotifications);
				}, 200)

			}else{
				//notification that is fake
				var scope_ = scope.$new();
				scope_.item = notification;
				var template = angular.element("<div></div>");
				template.html($templateCache.get(NCSigleNTemlpateURL));
				template = $compile(template)(scope_)
				setTimeout(function(){
					ngToast.create({
						className: 'notifi-cell',
						content: template[0].outerHTML
					});
				}, 200)
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

		this.setStringifier = function(stringifierFn){
			stringifier = stringifierFn;
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
					if(loading.get() || allNotificationsLoaded){
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
					setTimeout(notification.seeNotifications, 3000);
				};
			}
		};
	}]).directive("notificationCenterWrap", ['notification', function(notification){
		return {
			restrict: "A",
			templateUrl: NCTemplateURL,
			scope: false
		};
	}]).directive("notification", ['notification', function(notification){
		return {
			templateUrl: NCSigleNTemlpateURL,
			scope: false,
			link: function(scope, el, attrs){
				el.addClass("hidden");
			}
		};
	}]).directive("singleNotification", ['notification', function(notification){
		return {
			restrict: "A",
			templateUrl: NCSigleNTemlpateURL,
			scope: true
		};
	}]);

export default "notificationCenter";
/*

{1: Access to variable reference is only possible this way}
{2: Function accessible with provider and factory}

*/