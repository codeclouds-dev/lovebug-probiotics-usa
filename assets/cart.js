/**
 * The Callout component is a clickable item that is used to add to cart.
 * @param {number} index - The index of the element.
 * @param {HTMLElement} element - The element that will be bound with this class.
 */
function Callout( index, element ) {
  this.$element = $( element );
  this.index = index;

  this.selectors = {
    button: ".callout__button"
  }

  this.initialize();
}

Callout.prototype = Object.assign( {}, Callout.prototype, {
  initialize: function() {
    // Get child elements.
    this.$button = this.$element.find( this.selectors.button );

    // Add event listeners.
    this.$button.on( "click", this._handleButtonClick.bind( this ) );
    this.$element.on( "cart:added", this._handleSuccesfulAddToCart.bind( this ) );
  },

  _getProductID: function() {
    const id = this.$element.data( "product-id" );

    return id;
  },

  _getProductProps: function() {
    const _bg_color = this.$element.data( "background-color" );
    const _highlight_color = this.$element.data( "highlight-color" );
    // const _compare_at_price = this.$element.data( "compare-price" );
    const _available_selling_plan = this.$element.data( "available-selling-plan" );

    return {
      _bg_color,
      _highlight_color,
      // _compare_at_price,
      _available_selling_plan
    };
  },

  _createCartEvent: function() {
    // Create a one-time event listener that will trigger "cart:added" event on this element.
    $( document ).one( "cart.requestComplete", function() {
      this.$element.trigger( "cart:added" );
    }.bind( this ) );
  },

  _addToCart: function( id ) {
    // Check if CartJS has been initialized.
    if( CartJS ) {
      const properties = this._getProductProps();

      // Add product with ID to cart and handle the events.
      CartJS.addItem( id, 1, properties );

      this._createCartEvent();
    }
  },

  _handleSuccesfulAddToCart: function() {
    console.log( "Item has been successfully added to the cart." );
  },

  _handleButtonClick: function( event ) {
    const id = this._getProductID();

    this._addToCart( id );
  }
});

// Initialize all .callout items with the Callout class.
$( ".callout" ).each( function( index, element ) {
  // Do something with the created callout.
  const callout = new Callout( index, element );
} );



/**
 * Cart component that adds class hooks depending on the state of the cart.
 * @param {number} index - The index of the element.
 * @param {HTMLElement} element - The element that will be bound with this class.
 */
function Cart( index, element ) {
  this.$element = $( element );
  this.index = index;

  this.selectors = {
    cartItems: ".cart-items"
  }

  this.states = {
    cartItems: {
      IS_REQUESTING: "cart-items--is-requesting"
    }
  }

  this.initialize();
}

Cart.prototype = Object.assign( {}, Cart.prototype, {
  initialize: function() {
    this.$cartItems = this.$element.find( this.selectors.cartItems );

    // Listen to the cart events.
    $( document ).on( "cart.requestStarted", this._handleCartRequestStart.bind( this ) );
    $( document ).on( "cart.requestComplete", this._handleCartRequestComplete.bind( this ) );
  },

  _handleCartRequestStart: function() {
    this.$cartItems.addClass( this.states.cartItems.IS_REQUESTING );
  },

  _handleCartRequestComplete: function() {
    this.$cartItems.removeClass( this.states.cartItems.IS_REQUESTING );
  }
} );

// Initialize all .cart__form items with the Cart class.
$( ".cart__form" ).each( function( index, element ) {
  // Do something with the created cart.
  const cart = new Cart( index, element );
} );