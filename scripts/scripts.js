/*
 * Copyright 2023 Adobe. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Build synthetic hero block.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  // Add hero building logic if needed
}

/**
 * load all headings and text decoration
 * @param {Element} main The container element
 */
function decorateMain(main) {
  // hopefully forward compatible decorations
  decorateButtons(main);
  decorateIcons(main);
  buildHeroBlock(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * loads everything needed to get to LCP.
 * @param {Element} doc The document element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* desktop header autochina */
    const windowWidth = window.innerWidth;
    if (windowWidth >= 900) {
      import('./header.js');
    }
  } catch (e) {
    // ignore
  }
}

/**
 * loads everything that doesn't need to be delayed.
 * @param {Element} doc The document element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const loader = doc.querySelector('header');
  if (loader) loadHeader(loader);

  const footer = doc.querySelector('footer');
  if (footer) loadFooter(footer);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadCSS(`${window.hlx.codeBasePath}/styles/styles.css`);

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // load anything that can be postponed to the latest here
  window.setTimeout(() => {
    import('./consent-check.js');
  }, 3000);
}

// ==========================================
// ADOBE CLIENT DATA LAYER (ACDL) & WEB SDK
// ==========================================

// 1. Initialize ACDL array globally before loading Tags
window.adobeDataLayer = window.adobeDataLayer || [];

// Populate initial state from localStorage if a saved ID exists
const savedCustId = localStorage.getItem('bankCustId');
if (savedCustId) {
  window.adobeDataLayer.push({
    user: {
      bankCustId: savedCustId
    }
  });
}

// 2. Add Event Listener to track dynamic inputs and push into ACDL
document.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT') {
    const val = e.target.value.trim();
    if (val) {
      localStorage.setItem('bankCustId', val);
      
      // Push state update + custom event to ACDL
      window.adobeDataLayer.push({
        event: 'userIdentifierUpdated',
        user: {
          bankCustId: val
        }
      });
    }
  }
});

// ==========================================
// STANDARD EDS PAGE EXECUTION & TAGS INJECTION
// ==========================================

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

// 3. Direct asynchronous script injection for Adobe Tags (Development environment)
const adobeScript = document.createElement('script');
adobeScript.src = 'https://assets.adobedtm.com/08c6c96e8270/50d004a48c15/launch-9b7eeff9d20b-development.min.js';
adobeScript.async = true;
document.head.appendChild(adobeScript);
