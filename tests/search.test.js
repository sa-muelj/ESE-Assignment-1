function search(term, data) {  
    return data.filter(item => item.toLowerCase().includes(term.toLowerCase()));  
}  
  
function getRandomString(length = 10) {  
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ';  
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');  
}  
  
function getRandomBlogTitles(numTitles = 15, titleLength = 10) {  
    return Array.from({ length: numTitles }, () => getRandomString(titleLength));  
}  
  
describe('search function for blog titles with random data', () => {  
    for (let i = 0; i < 5; i++) {  // Run 5 different test cases with random data  
        test(`dynamic search test ${i + 1}`, () => {  
            const blogTitles = getRandomBlogTitles();  
            const searchTerm = blogTitles[Math.floor(Math.random() * blogTitles.length)].substring(0, 3);  
            const expectedResults = blogTitles.filter(title => title.toLowerCase().includes(searchTerm.toLowerCase()));  
  
            expect(search(searchTerm, blogTitles)).toEqual(expectedResults);  
        });  
    }  
});