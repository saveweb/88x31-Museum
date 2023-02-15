// file form https://github.com/greggman/pixel-perfect.js/
// author: greggman

// The MIT License (MIT)
//
// Copyright (c) 2022 Gregg Tavares
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// 此文件有经过修改，并非原始版本

export function makePixelPerfect(elem) {
  if (elem instanceof HTMLImageElement && !elem.complete) {
    elem.decode()
      .then(() => {
        makePixelPerfect(elem);
      });
    return;
  }
  const origWidth = elem.naturalWidth || elem.width; // TODO, handle canvas, video?
  const origHeight = elem.naturalHeight || elem.height;
  const options = {
    scale: 1,
  };

  {
    const q = elem.dataset.pixelPerfect;
    if (q) {
      if (q.includes('=')) {
        Object.assign(options, Object.fromEntries(new URLSearchParams(elem.dataset.pixelPerfect || '').entries()));
      } else {
        const scale = parseInt(q);
        if (scale > 0) {
          options.scale = scale;
        }
      }
    } else {
      // guess the scale based on the natural size vs the CSS size
      const cssWidth = Math.round(parseFloat(getComputedStyle(elem).width));
      const scale = Math.round(Math.max(1, cssWidth / origWidth));
      if (scale > 0) {
        elem.dataset.pixelPerfect = scale;
        options.scale = scale;
      }
    }

  }

  const scale = options.scale
  if (scale % 1 !== 0) {
    console.warn('scale must be an integer value');
  }

  const px = v => `${v}px`;

  const desiredWidth = origWidth * scale;
  const targetWidth = desiredWidth * devicePixelRatio;
  const mult = Math.max(1, Math.round(targetWidth / origWidth));
  elem.style.width = px(origWidth * mult / devicePixelRatio);
  elem.style.height = px(origHeight * mult / devicePixelRatio);
}

function makeAllPixelPerfect() {
  document.querySelectorAll(".pixel-perfect").forEach(makePixelPerfect);
}

// https://stackoverflow.com/questions/62243495/how-to-archieve-pixel-perfect-pixelart-upscaling-with-css
// calc(calc(100vw / calc(1920 /*viewport screen pixel width, needs to be equivalent to 100vw for it to look best*/ / 4 /*factor*/)) * 15 /*pixelart width*/)

window.addEventListener('resize', makeAllPixelPerfect);
makeAllPixelPerfect();

// NOTE: ResizeObserver will not work as
// from the POV of HTML the elements are not changing
// size when the user zooms.