
define('modules/models-cart',['underscore', 'modules/backbone-mozu', 'hyprlive', "modules/api"], function (_, Backbone, Hypr, api) {

    var CartItemProduct = Backbone.MozuModel.extend({
        helpers: ['mainImage'],
        mainImage: function() {
            var imgs = this.get("productImages"),
                img = imgs && imgs[0],
                imgurl = 'http://placehold.it/160&text=' + Hypr.getLabel('noImages');
            return img || { ImageUrl: imgurl, imageUrl: imgurl }; // to support case insensitivity
        },
        initialize: function() {
            var url = "/product/" + this.get("productCode");
            this.set({ Url: url, url: url });
        }
    }),

    CartItem = Backbone.MozuModel.extend({
        relations: {
            product: CartItemProduct
        },
        validation: {
            quantity: {
                min: 1
            }
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        mozuType: 'cartitem',
        handlesMessages: true,
        helpers: ['priceIsModified'],
        priceIsModified: function() {
            var price = this.get('unitPrice');
            return price.baseAmount != price.discountedAmount;
        },
        saveQuantity: function() {
            if (this.hasChanged("quantity")) this.apiUpdateQuantity(this.get("quantity"));
        }
    }),

    Cart = Backbone.MozuModel.extend({
        mozuType: 'cart',
        handlesMessages: true,
        helpers: ['isEmpty','count'],
        relations: {
            items: Backbone.Collection.extend({
                model: CartItem
            })
        },
        
        initialize: function() {
            this.get("items").on('sync remove', this.fetch, this)
                             .on('loadingchange', this.isLoading, this);
        },
        isEmpty: function() {
            return this.get("items").length < 1;
        },
        count: function() {
            return this.apiModel.count();
            //return this.get("Items").reduce(function(total, item) { return item.get('Quantity') + total; },0);
        },
        toOrder: function() {
            var me = this;
            me.apiCheckout().then(function(order) {
                me.trigger('ordercreated', order);
            });
        },
        removeItem: function (id) {
            return this.get('items').get(id).apiModel.del();
        },
        addCoupon: function () {
            var me = this;
            var code = this.get('couponCode');
            var orderDiscounts = me.get('orderDiscounts');
            if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                // to maintain promise api
                var deferred = api.defer();
                deferred.reject();
                deferred.promise.otherwise(function () {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                    });
                });
                return deferred.promise;
            }
            this.isLoading(true);
            return this.apiAddCoupon(this.get('couponCode')).then(function () {
                me.set('couponCode', '');
                var productDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'productDiscounts'));
                var shippingDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'shippingDiscounts'));

                var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts);
                var lowerCode = code.toLowerCase();
                if (!allDiscounts || !_.find(allDiscounts, function (d) {
                    return d.couponCode.toLowerCase() === lowerCode;
                })) {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeError', code)
                    });
                }
                me.isLoading(false);
            });
        }
    });

    return {
        CartItem: CartItem,
        Cart: Cart
    };
});
/**
 * Quick utility to use on Backbone MozuViews. In case some third party
 * absolutely has to bind an event to an individual DOM element, the view will 
 * need to preserve that actual element between renders. Normally, .render()
 * with HyprLive will destroy and recreate the view's entire innerHTML. This
 * function will take a set of CSS selectors and a callback, and will preserve
 * matching elements through multiple renders, by storing a reference to them
 * and then putting them back where they were. Call this function in your
 * .render() method and send the view-destroying function as its
 * `renderCallback`. You'll be glad you did.
 *
 * Example:
 *
 *     define(['preserve-element-through-render', 'backbone'], 
 *       function(preserveElements, Backbone) {
 *         return Backbone.MozuView.extend({
 *           render: function() {
 *             preserveElements(this, ['.v-button'], function() {
 *               Backbone.MozuView.prototype.render.call(this);
 *             });
 *           }    
 *         });
 *     });
 * 
 * 
 * @param {object} view The Backbone.MozuView we're working with.
 * @param {string[]} selectors An array of selectors for elements to preserve.
 * @param {function} renderCallback A callback representing the render action.
 */

define('modules/preserve-element-through-render',['underscore'], function(_) {
  return function(view, selectors, renderCallback) {
    var thisRound = {};
    view._preserved = view._preserved || {};
    _.each(selectors, function(selector) {
      thisRound[selector] = view.$(selector);
    });
    renderCallback.call(view);
    _.each(thisRound, function($element, selector) {
      var $preserved = view._preserved[selector];
      if ($element.length > 0 && (!$preserved || $preserved.length === 0)) {
        $preserved = view._preserved[selector] = $element;
      }
      if ($preserved && $preserved.length > 0) {
        view.$(selector).replaceWith($preserved);
      }
    });

  };
});
define('pages/cart',['modules/backbone-mozu', 'underscore', 'modules/jquery-mozu', 'modules/models-cart', 'modules/cart-monitor', 'hyprlivecontext', 'hyprlive', 'modules/preserve-element-through-render'], function (Backbone, _, $, CartModels, CartMonitor, HyprLiveContext, Hypr, preserveElement) {
    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        initialize: function () {
            var me = this;

            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });


            var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
            var pageContext = require.mozuData('pagecontext');
            if (visaCheckoutSettings.isEnabled) {
                window.onVisaCheckoutReady = initVisaCheckout;
                require([pageContext.visaCheckoutJavaScriptSdkUrl], initVisaCheckout);
            }
        },
        render: function() {
            preserveElement(this, ['.v-button'], function() {
                Backbone.MozuView.prototype.render.call(this);
            });
        },
        updateQuantity: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(), 10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                item.saveQuantity();
            }
        },400),
        removeItem: function(e) {
            var $removeButton = $(e.currentTarget),
                id = $removeButton.data('mz-cart-item');
            this.model.removeItem(id);
            return false;
        },
        empty: function() {
            this.model.apiDel().then(function() {
                window.location.reload();
            });
        },
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            //this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
        addCoupon: function () {
            var self = this;
            this.model.addCoupon().ensure(function () {
                self.model.unset('couponCode');
                self.render();
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('#cart-coupon-code').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('#cart-coupon-code').prop('disabled', true);
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    /* begin visa checkout */
    function initVisaCheckout (model, total) {
        var delay = 500;
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var apiKey = visaCheckoutSettings.apiKey;
        var clientId = visaCheckoutSettings.clientId;

        // if this function is being called on init rather than after updating cart total
        if (!model) {
            model = CartModels.Cart.fromCurrent();
            total = model.get('total');
            delay = 0;

            // on success, attach the encoded payment data to the window
            // then turn the cart into an order and advance to checkout
            V.on("payment.success", function(payment) {
                // payment here is an object, not a string. we'll stringify it later
                var $form = $('#cartform');
                
                _.each({

                    digitalWalletData: JSON.stringify(payment),
                    digitalWalletType: "VisaCheckout"

                }, function(value, key) {
                    
                    $form.append($('<input />', {
                        type: 'hidden',
                        name: key,
                        value: value
                    }));

                });

                $form.submit();

            });

            // for debugging purposes only. don't use this in production
            V.on("payment.cancel", function(payment) {
                console.log({ cancel: JSON.stringify(payment) });
            });

            // for debugging purposes only. don't use this in production
            V.on("payment.error", function(payment, error) {
                console.warn({ error: JSON.stringify(error) });
            });
        }

        // delay V.init() while we wait for MozuView to re-render
        // we could probably listen for a "render" event instead
        _.delay(V.init, delay, {
            apikey: apiKey,
            clientId: clientId,
            paymentRequest: {
                currencyCode: model ? model.get('currencyCode') : 'USD',
                total: "" + total
            }
        });
    }
    /* end visa checkout */

    $(document).ready(function() {
        var cartModel = CartModels.Cart.fromCurrent(),
            cartViews = {

                cartView: new CartView({
                    el: $('#cart'),
                    model: cartModel,
                    messagesEl: $('[data-mz-message-bar]')
                })

            };

        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = "/checkout/" + order.prop('id');
        });

        cartModel.on('sync', function() {
            CartMonitor.setCount(cartModel.count());
        });

        window.cartView = cartViews;

        CartMonitor.setCount(cartModel.count());
    });

});
