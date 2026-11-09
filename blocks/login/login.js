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

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const consumerId = block.querySelector('#consumer-id').value.trim();
    const password = block.querySelector('#password').value;

    if (consumerId !== '' && password === 'abc@123') {
      messageDiv.className = 'login-message success';
      messageDiv.textContent = `Welcome, ${consumerId}! Login successful.`;
      sessionStorage.setItem('crm_id', consumerId);
    } else {
      messageDiv.className = 'login-message error';
      messageDiv.textContent = 'Invalid credentials. Password must be abc@123.';
    }
  });
}
