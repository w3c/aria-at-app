let arr1 = [];
const arrMulti = [
  [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ],
  [
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18]
  ],
  [
    [19, 20, 21],
    [22, 23, 24],
    [25, 26, 27]
  ]
];

for (let i = 0; i < 10; i += 1) {
  arr1.push(i);
}





const arr2 = [];

arr1.forEach(e => {
  if (e % 2 === 0) {
    return;
  }else {
    arr2.push(e)
  }
});
// arr1.forEach(e => {
//   if (e % 2 === 0) {
//     e = "String"
//   }
// });

console.log(arrMulti);


