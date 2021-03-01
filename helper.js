import faker from 'faker';

export function fetchData(count = 10) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = faker.helpers.contextualCard();
    item.paragraph = faker.lorem.paragraph();
    item.img = {
      src: `/static/images/${faker.random.number({ min: 1, max: 20 })}.jpeg`,
      width: `${faker.random.number({ min: 100, max: 700 })}px`,
    };
	// 由于faker avatar 可能访问不到
	item.avatar = '/static/logo.png'
    result.push(item);
  }
  return result;
}
