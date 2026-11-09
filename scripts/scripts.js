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

/**
 * Initialize global data layer structure
 */
window.digitalData = window.digitalData || {
  user: {
    bankCustId: localStorage.getItem('bankCustId') || '',
  },
};

/**
 * Sets up live input listener to capture BankCustID dynamically
 */
function setupCustomerTracking() {
  document.addEventListener('input', (event) => {
    // Target your customer ID input field (adjust selector if needed, e.g., input[name="bankCustId"])
    if (event.target && (event.target.id === 'bankCustId' || event.target.name === 'bankCustId' || event.target.classList.contains('bank-cust-id'))) {
      const val = event.target.value;
      window.digitalData.user.bankCustId = val;
      localStorage.setItem('bankCustId', val);
    }
  });
}

/**
 * Loads Adobe Experience Platform Web SDK Tags library
 */
function loadAdobeTags() {
  const script = document.createElement('script');
  script.src = 'https://assets.adobedtm.com/08c6c96e8270/50d004a48c15/launch-9b7eeff9d20b-development.min.js';
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Builds all synthetic blocks.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // Add auto-block logic here if needed
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  // Build and decorate auxiliary elements/blocks
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
 async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  }

  try {
    // Initialize customer ID capture listener early
    setupCustomerTracking();
  } catch (e) {
    console.error('Customer tracking setup failed', e);
  }
}

/**
 * Loads everything that doesn't need to be in the immediate view.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));

  // Load Adobe Tags / Web SDK asynchronously during lazy phase
  loadAdobeTags();
}

/**
 * Loads everything that happens a lot later,
 * without impacting performance.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // User custom delayed logic can go here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
