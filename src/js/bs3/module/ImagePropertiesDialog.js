define([
  'summernote/base/core/key'
], function (key) {
  var ImagePropertiesDialog = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var $editor = context.layoutInfo.editor;
    var options = context.options;
    //var lang = options.langInfo;

    this.initialize = function () {
      var $container = options.dialogsInBody ? $(document.body) : $editor;

      var body = '<div class="form-group">' +
                   '<label>Alt</label>' +
                   '<input class="note-alt-text form-control" type="text" />' +
                 '</div>' +
                 '<div class="form-group">' +
                   '<label>Title</label>' +
                   '<input class="note-title-text form-control" type="text" />' +
                 '</div>';
      var footer = '<button href="#" class="btn btn-primary note-image-properties-btn">Submit</button>';

      this.$dialog = ui.dialog({
        className: 'image-properties-dialog',
        title: 'Modify Image Properties',
        fade: options.dialogsFade,
        body: body,
        footer: footer
      }).render().appendTo($container);
    };

    this.destroy = function () {
      ui.hideDialog(this.$dialog);
      this.$dialog.remove();
    };

    this.bindEnterKey = function ($input, $btn) {
      $input.on('keypress', function (event) {
        if (event.keyCode === key.code.ENTER) {
          $btn.trigger('click');
        }
      });
    };

    /**
     * Show link dialog and set event handlers on dialog controls.
     *
     * @param {Object} imgInfo
     * @return {Promise}
     */
    this.showLinkDialog = function (imgInfo) {
      return $.Deferred(function (deferred) {
        var $imageAlt = self.$dialog.find('.note-alt-text'),
        $imageTitle = self.$dialog.find('.note-title-text'),
        $linkBtn = self.$dialog.find('.note-image-properties-btn');
        //$openInNewWindow = self.$dialog.find('input[type=checkbox]');

        ui.onDialogShown(self.$dialog, function () {
          context.triggerEvent('dialog.shown');

          $imageAlt.val(imgInfo.alt);
          $imageTitle.val(imgInfo.title);

          $imageAlt.on('input', function () {
            //ui.toggleBtn($linkBtn, $imageAlt.val() && $imageAlt.val());
            // if linktext was modified by keyup,
            // stop cloning text from linkUrl
            $imageAlt.text = $imageAlt.val();
          });

          $imageTitle.on('input', function () {
            //ui.toggleBtn($linkBtn, $imageTitle.val() && $imageTitle.val());
            $imageTitle.text = $imageTitle.val();
          });

          //self.bindEnterKey($linkUrl, $linkBtn);
          //self.bindEnterKey($linkText, $linkBtn);

          $linkBtn.one('click', function (event) {
            event.preventDefault();

            deferred.resolve({
              alt: $imageAlt.val(),
              title: $imageTitle.val(),
              imgDom: imgInfo.imgDom
            });
            self.$dialog.modal('hide');
          });
        });

        ui.onDialogHidden(self.$dialog, function () {
          // detach events
          $imageAlt.off('input keypress');
          $imageTitle.off('input keypress');
          $linkBtn.off('click');

          if (deferred.state() === 'pending') {
            deferred.reject();
          }
        });

        ui.showDialog(self.$dialog);
      }).promise();
    };

    /**
     * @param {Object} layoutInfo
     */
    this.show = function () {

      var imgInfo = context.invoke('editor.getImageInfo');

      this.showLinkDialog(imgInfo).then(function (imgInfo) {
        context.invoke('editor.updateImageProperties', imgInfo);
      }).fail(function () {
        context.invoke('editor.restoreRange');
      });
    };
    //context.memo('help.linkDialog.show', options.langInfo.help['linkDialog.show']);
  };

  return ImagePropertiesDialog;
});
