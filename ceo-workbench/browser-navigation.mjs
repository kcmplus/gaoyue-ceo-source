export async function navigate(page,key){
  const button=page.locator(`#nav [data-view="${key}"]`);
  if(!await button.isVisible()){
    const group=button.locator('xpath=ancestor::section[contains(@class,"nav-group")]');
    await group.locator('.nav-group-toggle').click();
  }
  await button.click();
}
