(function () {
    'use strict'

    /* dropzone */
    // let myDropzone = new Dropzone(".dropzone");
    //     myDropzone.on("addedfile", file => {
    // });

    /* filepond */
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageExifOrientation,
        FilePondPluginFileValidateSize,
        FilePondPluginFileEncode,
        FilePondPluginImageEdit,
        FilePondPluginFileValidateType,
        FilePondPluginImageCrop,
        FilePondPluginImageResize,
        FilePondPluginImageTransform
    );

    /* multiple upload */
    const MultipleElement = document.querySelector('.multiple-filepond');
    FilePond.create(MultipleElement,);
    
    /* single upload */
    // FilePond.create(
    //     document.querySelector('.single-fileupload'),
    //     {
    //         labelIdle: `Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`,
    //         imagePreviewHeight: 170,
    //         imageCropAspectRatio: '1:1',
    //         imageResizeTargetWidth: 200,
    //         imageResizeTargetHeight: 200,
    //         stylePanelLayout: 'compact circle',
    //         styleLoadIndicatorPosition: 'center bottom',
    //         styleButtonRemoveItemPosition: 'center bottom'
    //     }
    // );

})();

function InputSemImagem(){
    const pond = FilePond.create(
        document.querySelector('.single-fileupload'),
        {
            labelIdle: `Arraste e solte a imagem ou <span class="filepond--label-action">Escolha</span>`,
            imagePreviewHeight: 170,
            imageCropAspectRatio: '1:1',
            imageResizeTargetWidth: 400,
            imageResizeTargetHeight: 400,
            stylePanelLayout: 'compact circle',
            styleLoadIndicatorPosition: 'center bottom',
            styleButtonRemoveItemPosition: 'center bottom',
            maxFileSize: '5MB',
            labelMaxFileSizeExceeded: `Max 5MB permitido!`,
            labelMaxFileSize: '!'
        }
    );
}

function InputComImagem(imagePath){
    const pond = FilePond.create(
        document.querySelector('.single-fileupload'),
        {
            labelIdle: `Arraste e solte a imagem ou <span class="filepond--label-action">Escolha</span>`,
            imagePreviewHeight: 170,
            imageCropAspectRatio: '1:1',
            imageResizeTargetWidth: 400,
            imageResizeTargetHeight: 400,
            stylePanelLayout: 'compact circle',
            styleLoadIndicatorPosition: 'center bottom',
            styleButtonRemoveItemPosition: 'center bottom',
            maxFileSize: '5MB'
        }
    );

    pond.addFile(imagePath);
}

function InputSemImagemQuad(){
    const pond = FilePond.create(
        document.querySelector('.single-fileuploadquad'),
        {
            labelIdle: `Arraste e solte a imagem ou <span class="filepond--label-action">Escolha</span>`,
            imagePreviewHeight: 125,
            imageCropAspectRatio: '1:1',
            imageResizeTargetWidth: 400,
            imageResizeTargetHeight: 400,
            stylePanelLayout: 'integrated',
            styleLoadIndicatorPosition: 'center bottom',
            styleButtonRemoveItemPosition: 'center bottom',
            maxFileSize: '5MB',
            labelMaxFileSizeExceeded: `Max 5MB permitido!`,
            labelMaxFileSize: '!'
        }
    );
}

function InputComImagemQuad(imagePath){
    const pond = FilePond.create(
        document.querySelector('.single-fileuploadquad'),
        {
            labelIdle: `Arraste e solte a imagem ou <span class="filepond--label-action">Escolha</span>`,
            imagePreviewHeight: 125,
            imageCropAspectRatio: '1:1',
            imageResizeTargetWidth: 400,
            imageResizeTargetHeight: 400,
            stylePanelLayout: 'integrated',
            styleLoadIndicatorPosition: 'center bottom',
            styleButtonRemoveItemPosition: 'center bottom',
            maxFileSize: '5MB'
        }
    );

    pond.addFile(imagePath);
}