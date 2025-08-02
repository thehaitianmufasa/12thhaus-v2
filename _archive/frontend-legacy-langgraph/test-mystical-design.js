const { chromium } = require('playwright');

async function testMysticalDesign() {
  console.log('🌟 Testing 12thhaus Mystical Design...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser so we can see what's happening
    slowMo: 1000 // Slow down for visibility
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to our mystical sanctuary
    console.log('🔮 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait a moment for animations to load
    await page.waitForTimeout(3000);
    
    // Take screenshot of the full page
    console.log('✨ Taking screenshot of mystical design...');
    await page.screenshot({ 
      path: '/Users/mufasa/Desktop/Clients/12thhaus-v2/frontend/mystical-design-test.png',
      fullPage: true 
    });
    
    // Check for specific mystical elements
    console.log('🌙 Checking for mystical elements...');
    
    // Check for cosmic background
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        background: computedStyle.background,
        backgroundImage: computedStyle.backgroundImage
      };
    });
    
    console.log('🌟 Body background:', bodyStyles.background);
    console.log('🌟 Body background image:', bodyStyles.backgroundImage);
    
    // Check for mystical cards
    const mysticalCards = await page.locator('.mystical-card').count();
    console.log(`🔮 Found ${mysticalCards} mystical cards`);
    
    // Check for cosmic buttons
    const cosmicButtons = await page.locator('.cosmic-bg').count();
    console.log(`⚡ Found ${cosmicButtons} cosmic buttons`);
    
    // Check if starfield is present
    const starfieldElements = await page.evaluate(() => {
      const beforePseudo = window.getComputedStyle(document.body, '::before');
      return {
        backgroundImage: beforePseudo.backgroundImage,
        animation: beforePseudo.animation
      };
    });
    
    console.log('✨ Starfield background:', starfieldElements.backgroundImage);
    console.log('✨ Starfield animation:', starfieldElements.animation);
    
    // Check for spiritual typography
    const fontCheck = await page.evaluate(() => {
      const body = document.body;
      const h1 = document.querySelector('h1');
      const computedBodyStyle = window.getComputedStyle(body);
      const computedH1Style = h1 ? window.getComputedStyle(h1) : null;
      
      return {
        bodyFont: computedBodyStyle.fontFamily,
        h1Font: computedH1Style ? computedH1Style.fontFamily : 'No h1 found',
        hasInterFont: computedBodyStyle.fontFamily.includes('Inter')
      };
    });
    
    console.log('🔤 Body font family:', fontCheck.bodyFont);
    console.log('🔤 H1 font family:', fontCheck.h1Font);
    console.log('🔤 Uses Inter (spiritual font):', fontCheck.hasInterFont ? '✅' : '❌');
    
    console.log('🌟 Test completed! Check mystical-design-test.png for results');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMysticalDesign();