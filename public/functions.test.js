import { sum, slicePath } from './functions';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('check if path is sliced correctly', () => {
  expect(slicePath('upload/1.jpg')).toBe('/1.jpg');
})