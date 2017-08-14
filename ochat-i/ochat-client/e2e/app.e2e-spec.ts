import { OchatClientPage } from './app.po';

describe('ochat-client App', () => {
  let page: OchatClientPage;

  beforeEach(() => {
    page = new OchatClientPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
