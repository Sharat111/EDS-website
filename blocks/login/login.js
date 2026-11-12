async function showWelcomeMessage(customerId) {
  const surface = 'web://main--eds-website--sharat111.aem.page/#navbarSupportedContent';

  const res = await window.alloy('sendEvent', {
    xdm: {
      eventType: 'identity.login',
      identityMap: { CustomerID: [{ id: customerId, primary: true, authenticatedState: 'authenticated' }] },
    },
    personalization: { surfaces: [surface] },
  });

  const prop = res?.propositions?.find((p) => p.scope === surface);
  const message = prop?.items?.[0]?.data?.content?.message;

  if (message) {
    document.querySelector('#navbarSupportedContent')?.prepend(message);
  }
}

export default function decorate(block) {
  block.innerHTML = `
    <div class="login-container">
      <h2>Account Login</h2>
      <form id="eds-login-form">
        <div class="field-group">
          <label for="consumer-id">Consumer ID</label>
          <input type="text" id="consumer-id" placeholder="Enter Consumer ID" required />
        </div>
        <div class="field-group">
          <label for="password">Password</label>
          <input type="password" id="password" value="abc@123" required />
        </div>
        <button type="submit" class="button primary">Log In</button>
        <div id="login-message" class="login-message"></div>
      </form>
    </div>
  `;

  const form = block.querySelector('#eds-login-form');
  const messageDiv = block.querySelector('#login-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const consumerId = block.querySelector('#consumer-id').value.trim();
    const password = block.querySelector('#password').value;

    if (consumerId !== '' && password === 'abc@123') {
      messageDiv.className = 'login-message success';
      messageDiv.textContent = `Welcome, ${consumerId}! Login successful.`;
      sessionStorage.setItem('crm_id', consumerId);
      await showWelcomeMessage(consumerId);
    } else {
      messageDiv.className = 'login-message error';
      messageDiv.textContent = 'Invalid credentials. Password must be abc@123.';
    }
  });
}
