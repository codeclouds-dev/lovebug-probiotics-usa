/**
 * Events:
 * "mfr:changed" - will fire when the quantity is changed. Event data will provide the current quantity
 * 
 * Attributes:
 * - these data attributes can be manipulated
 * data-min - for the minimum quantity
 * data-max - for the maximum quantity
 * 
 * Methods:
 * - .mfrQuantitySelector( "set-quantity", value )
 * - .mfrQuantitySelector( "get-quantity" )
 */
class QuantitySelector {
  constructor( i, e ) {
    this.$index = i;
    this.$element = $( e );

    this.selectors = {
      input: ".quantity-selector__input",
      plus: ".quantity-selector__plus",
      minus: ".quantity-selector__minus",
      count: ".quantity-selector__count",
      unit: ".quantity-selector__unit",
      formContainer: ".product__form",
      buttonPrice: ".price-item"
    }

    this.init();
  }

  init() {
    this.$input = this.$element.find(this.selectors.input);
    this.$plus = this.$element.find(this.selectors.plus);
    this.$minus = this.$element.find(this.selectors.minus);
    this.$count = this.$element.find(this.selectors.count);
    this.$unit = this.$element.find(this.selectors.unit);

    this.$plus.on("click", this._handlePlus.bind(this));
    this.$minus.on("click", this._handleMinus.bind(this));
    this.addJqueryFunction();
  }

  _updateQuantity(value) {
    // Update the input value.
    this.$input.val(value);

    // Update the visual count.
    this.$count.text(value);

    this.$element.trigger( "mfr:quantity-changed", [ parseInt( this.$input.val() ) ] );
  }

  _handlePlus() {
    const currentCount = parseInt(this.$input.val());
    if (currentCount >= this.$element.data( "max" ) ) return;

    this._updateQuantity(currentCount + 1);
  }

  _handleMinus() {
    const currentCount = parseInt(this.$input.val());

    // Only decrease count when it's greater than the minimum.
    if ( currentCount > this.$element.data( "min" ) )
      this._updateQuantity(currentCount - 1);
  }

  addJqueryFunction() {
    const self = this;
    if( !jQuery ) return;

    jQuery.fn.extend({
      mfrQuantitySelector: function( method, value ) {
        if ( !$( this ).hasClass( "quantity-selector" ) ) {
          return $(this); // do nothing
        }
        if( method == "set-quantity" ) {
          self.$input.val( value );
          self.$count.text( value );
          self.$element.trigger( "mfr:quantity-changed", [ parseInt( self.$input.val() ) ] );
        }
        
        if( method == "get-quantity" ) return self.$input.val();

        return $(this);
      }
    })
  }
}

/**
 * Events:
 * "mfr:changed" - will fire when the variant is changed. Event data will be provide the variant max quantity and variant price
 * 
 * Attributes:
 * - these data attributes can be manipulated
 * data-max - for the maximum quantity of the variant
 * data-price - for the price of the variant
 * 
 * Methods:
 * - .mfrVariantSelector( "get-price" )
 */
class VariantSelector {
  constructor(i, e) {
    this.$index = i
    this.$element = $(e)

    this.selectors = {
      hiddenInput: ".variant-selector__hidden-selector",
      options: ".variant-selector__options",
      option: ".variant-selector__option",
      jsonScript: ".variant-selector__variants-json[type='application/json']",
      jsonIngredientScript:
        ".variant-selector__ingredients-json[type='application/json']",
      optionInput: ".variant-selector__options label input",
      inputWrapper: ".variant-selector__variant-option",
      quantityJson:
        ".variant-selector__quantities-json[type='application/json']",
      stickyBar: ".product-sticky-bar__form", // Project specific
      topBar: ".product-top__form", // Project specific
      stickyBarText: ".product-sticky-bar__text", // Project specific
      breadcrumbActive: ".current-link", // Project specific
      shadeName: ".shade-name", // Project specific
      shadeDescription: ".shade-description", // Project specific
      variantPriceOriginal: ".product-top__price-old-value", // Project specific
      variantPriceDiscounted: ".product-top__price-value", // Project specific
      productCarousel: ".product-top__images-carousel", // Project specific
      productAccordionIngredient: "[data-accordion-content='ingredients']",
      stickyPrice: "#sticky-price",
    };

    this.selectedOptions
    this.variants

    this.init()
  }

  init() {
    this.$input = this.$element.find(this.selectors.hiddenInput)
    this.$options = this.$element.find(this.selectors.options)
    this.$jsonScript = this.$element.find(this.selectors.jsonScript)
    this.$jsonIngredientScript = this.$element.find(this.selectors.jsonIngredientScript)
    this.$quantityJson = this.$element.find(this.selectors.quantityJson)
    this.$masterInput = $(`${this.$element.data('form')}`).find("input[name='id']")
    this.$variantTitle = $(`${this.$element.data('form')}`).find("input[name='properties[_variant_nice_title]']")
    this.$optionInput = this.$element.find(this.selectors.optionInput)
    this.$inputWrapper = this.$element.find(this.selectors.inputWrapper)

    // Project specific
    this.$stickyBar = $(this.selectors.stickyBar)
    this.$topBar = $(this.selectors.topBar)
    this.$stickyBarText = $(this.selectors.stickyBarText)
    this.$breadcrumbActive = $(this.selectors.breadcrumbActive)
    this.$shadeName = $(this.selectors.shadeName)
    this.$shadeDescription = $(this.selectors.shadeDescription)
    this.$variantPriceOriginal = $(this.selectors.variantPriceOriginal)
    this.$variantPriceDiscounted = $(this.selectors.variantPriceDiscounted)
    this.$productCarousel = $(this.selectors.productCarousel)
    this.$productAccordionIngredient = $(this.selectors.productAccordionIngredient)
    this.$stickyPrice = $(this.selectors.stickyPrice);

    if (!this.$element.length) return
    this.initVariants()
    this.addJqueryFunction()
    this.updateSelectedOptions()
    this.updateVariantStatuses()
    this.updateStickyButtonColor() // Project specific
    this.updateMasterId()

    this.$input.on('change', this.__handleVariantChange.bind(this))
    this.$optionInput.on('change', this.__handleOptionChange.bind(this))
  }

  __handleVariantChange() {
    const selector = this.$input
    const selectedOption = selector.find('option:selected')
    const maxQuantity = selectedOption.data('max')
    const price = selectedOption.data('price')
    const options = selectedOption.data('options').split(',')
    this.$element.trigger('mfr:changed', [
      {
        max: maxQuantity,
        price: price,
        options: options,
      },
    ])
  }

  __handleOptionChange(e) {
    this.updateSelectedOptions()
    this.updateVariantStatuses()
    this.updateMasterId()
    this.updateStickyBarSelectedVariantInput(this.currentVariant.id) // Update the stickybar variant input
    this.updateTopBarSelectedVariantInput(this.currentVariant.id) 
    this.updateCurentVariantContent(this.currentVariant, e.currentTarget)
    this.updateCurentVariantPrice(e.currentTarget)
    this.updateCurentVariantColorIndicator(e.currentTarget)
    this.updateCurentVariantTitleIntoHiddenProperties(e.currentTarget)
    this.updateCurentVariantFeaturedImage(this.currentVariant)
    this.updateCurentVariantMedia(this.currentVariant)
    this.updateCurentVariantIngredients(this.currentVariant)

    this.$element.trigger('mfr:changed', [
      {
        max: this.getQuantitiesData()[this.currentVariant.id],
        price: this.currentVariant.price.toFixed(2) / 100,
      },
    ])
  }

  // Project specific
  updateStickyButtonColor() {
    const $stickyAddToCartButton = this.$stickyBar.find('button.add-to-cart')
    let stickyAddToCartButtonBrightness = tinycolor($stickyAddToCartButton.css('backgroundColor'))

    if (stickyAddToCartButtonBrightness.isLight()) {
      $stickyAddToCartButton.css('color', '#2c3233')
    } else {
      $stickyAddToCartButton.css('color', '#ffffff')
    }
  }

  // Project specific
  updateStickyBarSelectedVariantInput(variantId) {
    let $selectedVariantInput = this.$stickyBar.find('input[name="id"]')

    if ($selectedVariantInput.length > 0) {
      $selectedVariantInput.val(variantId)
    }
  }

  updateTopBarSelectedVariantInput(variantId) {
    let $selectedVariantInput = this.$topBar.find('input[name="id"]')

    if ($selectedVariantInput.length > 0) {
      $selectedVariantInput.val(variantId)
    }
  }

  // Project specific
  updateCurentVariantContent(variant, variantInput) {
    if (this.$breadcrumbActive.length > 0 || this.$shadeName.length > 0) {
      this.$breadcrumbActive.text(variant.title)
      // this.$shadeName.text(variant.title);
    }

    // if ( this.$shadeDescription.length > 0 ) {
    //   this.$shadeDescription.text($(variantInput).data('shade'));
    // }
  }

  // Project specific
  updateCurentVariantTitleIntoHiddenProperties(variant) {
    if (this.$variantTitle.length > 0) {
      this.$variantTitle.val($(variant).data('title'))
    }
  }

  // Project specific
  updateCurentVariantPrice(variant) {
    if (this.$variantPriceOriginal.length > 0) {
      this.$variantPriceOriginal.text($(variant).data('discounted'))
    }

    if (this.$variantPriceDiscounted.length > 0) {
      this.$variantPriceDiscounted.text($(variant).data('price'))
    }

    if (this.$stickyPrice.length) {
      this.$stickyPrice.text($(variant).data("price"));
    }
  }

  // Project specific
  updateCurentVariantColorIndicator(variant) {
    let variantColorTheme = $(variant).data('color')
    let variantBrightness = tinycolor(variantColorTheme)

    const $stickyAddToCartButton = this.$stickyBar.find('button.add-to-cart')
    const $stickyShadeColor = this.$stickyBarText.find('.shade-color')
    const $stickyShadeName = this.$stickyBarText.find('.shade-name')
    const $stickyShadeDesc = this.$stickyBarText.find('.shade-description')

    if ($stickyAddToCartButton.length > 0) {
      $stickyAddToCartButton.css('background-color', variantColorTheme)

      if (variantBrightness.isLight()) {
        $stickyAddToCartButton.css('color', '#2c3233')
      } else {
        $stickyAddToCartButton.css('color', '#ffffff')
      }
    }

    if ($stickyShadeColor.length > 0) {
      $stickyShadeColor.css('background-color', variantColorTheme)
    }

    if ($stickyShadeName.length > 0) {
      $stickyShadeName.text(variant.value)
    }

    if ($stickyShadeDesc.length > 0) {
      $stickyShadeDesc.text($(variant).data('shade'))
    }

    // For Product Cards
    const $form = $(variant).closest('.product-card').find('form')
    const $addToCart = $form.find('.product-card__button')

    if ($addToCart.length > 0) {
      $addToCart.css('background-color', variantColorTheme)

      if (variantBrightness.isLight()) {
        $addToCart.css('color', '#2c3233')
      } else {
        $addToCart.css('color', '#ffffff')
      }
    }

    if ($addToCart.length > 0) {
      $addToCart.css('background-color', variantColorTheme)
    }
  }

  updateShadeDescription(e) {
    if (!this.$shadeName.length) return
    const $variantSelectors = $(e.currentTarget)
    const $selectedVariant = $variantSelectors.find('input:checked')
    const niceTitle = $selectedVariant.data('title')

    if (niceTitle.includes('-')) {
      this.$shadeName.html(`
        <span class="shade-name">
          ${niceTitle.split('-')[0]}
        </span>
        &ndash;
        <span class="shade-description">
          ${niceTitle.split('-')[niceTitle.split('-').length - 1]}
        </span>
      `)
    } else {
      this.$shadeName.text(niceTitle)
    }
  }

  // Project specific
  updateCurentVariantFeaturedImage(variant) {
    let variantMediaIndex = variant.featured_media.position - 1

    if (this.$productCarousel.length > 0) {
      this.$productCarousel.flickity('select', variantMediaIndex)
    }
  }

  // Project specific
  updateCurentVariantMedia(variant) {
    if (!window.location.pathname.includes('/products')) {
      return
    }

    const variants_media_array = window.variants_media_array

    let selectedVariantMedia = variants_media_array.filter((item) => item.id === variant.id)
    let selectedVariantFeaturedImage = selectedVariantMedia[0].featured_image
    let newProductCarouselSlides = ''
    let sliderOptions = {
      wrapAround: false,
      prevNextButtons: true,
      adaptiveHeight: false,
      pageDots: true,
      selectedAttraction: 0.1,
      friction: 0.55,
      cellAlign: 'center',
    }

    if (this.$productCarousel.length > 0) {
      this.$productCarousel.flickity('destroy')

      newProductCarouselSlides += `
        <div class="product-top__image ${selectedVariantFeaturedImage.type}">
          <div class="product-image-component">
            <img src="${selectedVariantFeaturedImage.src}" alt="${selectedVariantFeaturedImage.alt}" loading="lazy" />
          </div>
        </div>
      `

      selectedVariantMedia[0].media.forEach((item, index) => {
        newProductCarouselSlides += `
          <div class="product-top__image ${item.type}">
            <div class="product-image-component">
              <img src="${item.src}" alt="${item.alt}" loading="lazy" />
            </div>
          </div>
        `
      })

      this.$productCarousel.html(newProductCarouselSlides)
      this.$productCarousel.flickity(sliderOptions)
      window.replaceFlickityArrows()
    }
  }

  // Project specific
  updateCurentVariantIngredients(variant) {
    if (!window.location.pathname.includes('/products')) {
      return
    }

    const variantIngredients = JSON.parse(this.$jsonIngredientScript.text())
    let selectedVarianIngrdient = variantIngredients.filter((item) => item.id === variant.id)

    if (selectedVarianIngrdient) {
      this.$productAccordionIngredient.html(`${selectedVarianIngrdient[0].ingredients}`)
    }
  }

  updateSelectedOptions() {
    const options = []
    this.$optionInput.each((i, e) => {
      const option = $(e)
      if (option.is(':checked')) {
        options.push(option.val())
      }
    })
    this.selectedOptions = options
  }

  initVariants() {
    const variants = []
    this.$input.find('option').each((i, e) => {
      const optionArr = $(e).data('options').split(',')

      variants.push(optionArr)
    })
    this.variants = variants
  }

  updateHiddenInput() {
    this.$input.find('option').each((i, option) => {
      const optionsArray = $(option).data('options').split(',')
      if (this.arraysEqual(optionsArray, this.selectedOptions)) {
        this.$input.val($(option).val()).trigger('change')
      }
    })
  }

  arraysEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.selectedOptions[index] === option
        })
        .includes(false)
    })
    this.$masterInput.val(this.currentVariant.id)
  }

  getVariantData() {
    const jsonScriptText = this.$jsonScript.text()
    this.variantData = this.variantData || JSON.parse(jsonScriptText)
    return this.variantData ?? {}
  }

  getQuantitiesData() {
    this.quantitiesData = this.quantitiesData || JSON.parse(this.$quantityJson.text())
    return this.quantitiesData
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.getVariantData().filter(
      (variant) => $(this.$element.find(`${this.selectors.optionInput}:checked`).get(0)).val() === variant.option1
    )
    this.$inputWrapper.each((index, wrapper) => {
      if (index === 0) return
      // const optionInputs = [
      //   ...option.querySelectorAll('input[type="radio"], option'),
      // ];
      const optionInputs = $(wrapper).find("input[type='radio']")
      const previousOptionSelected = $(this.$inputWrapper.get(index - 1))
        .find(':checked')
        .val()
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected)
        .map((variantOption) => variantOption[`option${index + 1}`])
      this.setInputAvailability(optionInputs, availableOptionInputsValue)
    })
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.each((index, input) => {
      if (listOfAvailableOptions.includes($(input).val())) {
        $(input).prop('disabled', false)
      } else {
        $(input).prop('disabled', true)
      }
    })
    this.$inputWrapper.each((index, wrapper) => {
      if (index === 0) return
      if (!$(wrapper).find("input[type='radio']:disabled:checked").length) return

      const optionInput = $(wrapper).find("input[type='radio']:not([disabled]):first")
      optionInput.prop('checked', true)
    })
    this.updateSelectedOptions()
    this.updateMasterId()
    this.$element.trigger('mfr:changed', [
      {
        max: this.getQuantitiesData()[this.currentVariant.id],
        price: this.currentVariant.price.toFixed(2) / 100,
      },
    ])
  }

  addJqueryFunction() {
    const self = this
    if (!jQuery) return
    jQuery.fn.extend({
      mfrVariantSelector: function (method, value) {
        if (!$(this).hasClass('variant-selector')) {
          return $(this) // do nothing
        }
        const selector = self.$input
        const selectedOption = selector.find('option:selected')
        if (method == 'get-price') return self.currentVariant.price.toFixed(2) / 100

        return $(this)
      },
    })
  }
}

/**
 * For Submitting Product Form
 */
class ProductForm extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    this.cartNotification.setActiveElement(document.activeElement);

    const submitButton = this.querySelector('[type="submit"]');

    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('loading');

    const body = JSON.stringify({
      ...JSON.parse(serializeForm(this.form)),
      sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
      .then((response) => response.json())
      .then((parsedState) => {
        this.cartNotification.renderContents(parsedState);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('disabled');
      });
  }
}

customElements.define('product-form', ProductForm);

function loadProductFormClasses() {
  const productFormClasses = {
    ".quantity-selector": "QuantitySelector"
  };

  Object.entries(productFormClasses).forEach((entry, index) => {
    const [key, value] = entry;
    // initializeComponent(key, value);
    const initComponent = eval(`
      if( typeof ${value} != "undefined" ) {
        new ${value}( index, key )
      }
    `);
  });
}
loadProductFormClasses();