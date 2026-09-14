const fs = require('fs');
const path = require('path');
const os = require('os');

const downloadsDir = path.join(os.homedir(), 'Downloads');
const subDir = path.join(downloadsDir, 'recall-test-csvs');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}
if (!fs.existsSync(subDir)) {
  fs.mkdirSync(subDir, { recursive: true });
}

const testFiles = [
  {
    name: '01_easy_perfect_leetcode.csv',
    content: `#,Title,Difficulty,Topic,URL,Date Solved,Notes
1,Two Sum,Easy,Arrays,https://leetcode.com/problems/two-sum/,2024-01-10,Classic hash map lookup
2,Add Two Numbers,Medium,Linked List,https://leetcode.com/problems/add-two-numbers/,2024-01-11,Handle carry node carefully
3,Longest Substring Without Repeating Characters,Medium,Sliding Window,https://leetcode.com/problems/longest-substring-without-repeating-characters/,2024-01-12,Set or map with two pointers
4,Median of Two Sorted Arrays,Hard,Binary Search,https://leetcode.com/problems/median-of-two-sorted-arrays/,2024-01-13,Binary search on partition
5,Longest Palindromic Substring,Medium,Dynamic Programming,https://leetcode.com/problems/longest-palindromic-substring/,2024-01-14,Expand around center
`,
  },
  {
    name: '02_alternative_headers.csv',
    content: `S.No,Question Name,Level,Category,Link,Completed Date,Remarks
11,Container With Most Water,Medium,Two Pointers,https://leetcode.com/problems/container-with-most-water/,2024-01-15,Two pointers from outside inward
15,3Sum,Medium,Two Pointers,https://leetcode.com/problems/3sum/,2024-01-16,Sort first then two pointer
20,Valid Parentheses,Easy,Stack,https://leetcode.com/problems/valid-parentheses/,2024-01-17,LIFO stack checking
21,Merge Two Sorted Lists,Easy,Linked List,https://leetcode.com/problems/merge-two-sorted-lists/,2024-01-18,Dummy head pointer
23,Merge k Sorted Lists,Hard,Heap,https://leetcode.com/problems/merge-k-sorted-lists/,2024-01-19,Priority queue min-heap
`,
  },
  {
    name: '03_varied_difficulties_and_dates.csv',
    content: `Problem Number,Title,Difficulty,Topic,URL,Date Solved,Notes
33,Search in Rotated Sorted Array,eAsY,Binary Search,https://leetcode.com/problems/search-in-rotated-sorted-array/,01/20/2024,Notice inflection point
42,Trapping Rain Water,3,Two Pointers,https://leetcode.com/problems/trapping-rain-water/,25/01/2024,EU date style
53,Maximum Subarray,1,Dynamic Programming,https://leetcode.com/problems/maximum-subarray/,Jan 22 2024,Kadane algorithm
70,Climbing Stairs,Simple,DP,https://leetcode.com/problems/climbing-stairs/,1705881600000,Fibonacci DP timestamp
76,Minimum Window Substring,Advanced,Sliding Window,https://leetcode.com/problems/minimum-window-substring/,45314,Excel serial date
94,Binary Tree Inorder Traversal,E,Trees,https://leetcode.com/problems/binary-tree-inorder-traversal/,2024-01-26,Left root right recursion
98,Validate Binary Search Tree,Moderate,Trees,https://leetcode.com/problems/validate-binary-search-tree/,2024-01-27,Pass min and max bounds
102,Binary Tree Level Order Traversal,2,Breadth First Search,https://leetcode.com/problems/binary-tree-level-order-traversal/,02/01/2024,Queue traversal
`,
  },
  {
    name: '04_multi_platform_mix.csv',
    content: `Platform,Problem Number,Title,Difficulty,Topic,URL,Date Solved
LEETCODE,121,Best Time to Buy and Sell Stock,Easy,Arrays,https://leetcode.com/problems/best-time-to-buy-and-sell-stock/,2024-02-01
Codeforces,4,Watermelon,Easy,Math,https://codeforces.com/problemset/problem/4/A,2024-02-02
GFG,,Kadane's Algorithm,Medium,Arrays,https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1,2024-02-03
HackerRank,,Solve Me First,Easy,Warmup,https://www.hackerrank.com/challenges/solve-me-first/problem,2024-02-04
CodeChef,,Add Two Numbers,Easy,Basic Math,https://www.codechef.com/problems/FLOW001,2024-02-05
CF,158,Next Round,Easy,Implementation,https://codeforces.com/problemset/problem/158/A,2024-02-06
`,
  },
  {
    name: '05_malformed_and_query_urls.csv',
    content: `Problem Number,Title,Difficulty,Topic,URL,Date Solved
128,Longest Consecutive Sequence,Medium,Hash Map,leetcode.com/problems/longest-consecutive-sequence/,2024-02-05
136,Single Number,Easy,Bit Manipulation,www.leetcode.com/problems/single-number,2024-02-06
139,Word Break,Medium,Dynamic Programming,https://leetcode.com/problems/word-break/?envType=study-plan-v2&envId=top-100-liked,2024-02-07
141,Linked List Cycle,Easy,Two Pointers,leetcode.com/problems/linked-list-cycle/#description,2024-02-08
146,LRU Cache,Hard,Design,http://leetcode.com/problems/lru-cache/,2024-02-09
152,Maximum Product Subarray,Medium,DP,https://leetcode.com/problems/maximum-product-subarray,2024-02-10
`,
  },
  {
    name: '06_missing_optional_fields_and_defaults.csv',
    content: `Title,Difficulty,Topic,URL,Date Solved,Notes
Number of Islands,,Graph,https://leetcode.com/problems/number-of-islands/,,DFS flood fill
Reverse Linked List,Easy,,,2024-02-12,Missing URL and topic
Course Schedule,Medium,Graph,https://leetcode.com/problems/course-schedule/,,Topological sort Kahn algorithm
House Robber,,,,,,Completely empty except title and notes
Implement Trie (Prefix Tree),Medium,Trie,https://leetcode.com/problems/implement-trie-prefix-tree/,2024-02-14,Prefix node design
Invert Binary Tree,,,,,Swapping children
Kth Largest Element in an Array,Medium,Heap,https://leetcode.com/problems/kth-largest-element-in-an-array/,2024-02-15,Min heap
`,
  },
  {
    name: '07_blank_lines_and_whitespace_chaos.csv',
    content: `  #   ,   Title   ,   Difficulty   ,   Topic   ,   URL   ,   Date Solved   
206,   Reverse Linked List   ,   Easy   ,   Linked List   ,   https://leetcode.com/problems/reverse-linked-list/   ,   2024-02-16   

215,Kth Largest Element in an Array,Medium,Heap,https://leetcode.com/problems/kth-largest-element-in-an-array/,2024-02-17
,,,,,,
226,Invert Binary Tree,Easy,Trees,https://leetcode.com/problems/invert-binary-tree/,2024-02-18

   
234,Palindrome Linked List,Easy,Linked List,https://leetcode.com/problems/palindrome-linked-list/,2024-02-19
 , , , , , 
236,Lowest Common Ancestor of a Binary Tree,Medium,Trees,https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/,2024-02-20


`,
  },
  {
    name: '08_quotes_commas_unicode_and_multiline.csv',
    content: `#,Title,Difficulty,Topic,URL,Date Solved,Notes
238,"Product of Array Except Self",Medium,Arrays,https://leetcode.com/problems/product-of-array-except-self/,2024-02-21,"Prefix and suffix products, O(1) extra space"
239,"Sliding Window Maximum",Hard,Monotonic Queue,https://leetcode.com/problems/sliding-window-maximum/,2024-02-22,"Maintain deque in descending order: a[i] >= a[i+1]"
240,"Search a 2D Matrix II",Medium,"Matrix, Binary Search",https://leetcode.com/problems/search-a-2d-matrix-ii/,2024-02-23,"Start top-right or bottom-left corner! 🚀"
242,"Valid Anagram",Easy,Hash Table,https://leetcode.com/problems/valid-anagram/,2024-02-24,"Frequency array: 'a' -> 0, 'z' -> 25"
268,"Missing Number",Easy,Bit Manipulation,https://leetcode.com/problems/missing-number/,2024-02-25,"XOR technique: 1 ^ 1 = 0 ✨"
283,"Move Zeroes",Easy,Two Pointers,https://leetcode.com/problems/move-zeroes/,2024-02-26,"Snowball technique, swap non-zero forward"
`,
  },
  {
    name: '09_duplicates_and_unsupported_sites.csv',
    content: `#,Title,Difficulty,Topic,URL,Date Solved,Notes
287,Find the Duplicate Number,Medium,Two Pointers,https://leetcode.com/problems/find-the-duplicate-number/,2024-02-27,Floyd cycle detection
287,Find the Duplicate Number (Duplicate Row),Medium,Two Pointers,https://leetcode.com/problems/find-the-duplicate-number/,2024-02-27,This duplicate should be skipped
295,Find Median from Data Stream,Hard,Heap,https://leetcode.com/problems/find-median-from-data-stream/,2024-02-28,Two heaps max and min
,Valid Problem Without ID,Medium,DP,https://leetcode.com/problems/two-sum/,2024-02-28,Valid title but no problem number
,,Hard,Trees,https://leetcode.com/problems/serialize-and-deserialize-binary-tree/,2024-03-01,Row has NO title - MUST be skipped
300,Longest Increasing Subsequence,Medium,Dynamic Programming,https://leetcode.com/problems/longest-increasing-subsequence/,2024-03-01,Patience sorting binary search O(N log N)
,Max Sum Contiguous Subarray,Medium,Arrays,https://www.interviewbit.com/problems/max-sum-contiguous-subarray/,2024-03-02,Unsupported platform link - fallback platform used
300,Longest Increasing Subsequence (Duplicate 2),Medium,DP,https://leetcode.com/problems/longest-increasing-subsequence/,2024-03-01,Another duplicate row
`,
  },
  {
    name: '10_the_boss_spreadsheet_nightmare.csv',
    content: `ID,Question Name,Platform Judge,Difficulty Rating,Tags,Web Link,Date Completed,My Personal Notes,Company Target,Time Taken (Mins),Acceptance Rate,Language
322,"Coin Change",LeetCode,2,"Dynamic Programming, BFS",leetcode.com/problems/coin-change/,03/01/2024,"Fewest coins: dp[i] = min(dp[i], dp[i-coin] + 1)",Google,25,44.2%,Python3
4,Watermelon,Codeforces,Simple,Math,https://codeforces.com/problemset/problem/4/A,Jan 5 2024,"Even split if w > 2 and w % 2 == 0",Meta,10,88.1%,C++

347,"Top K Frequent Elements",LC,Med,"Hash Table, Heap",https://leetcode.com/problems/top-k-frequent-elements/?envType=study-plan,45350,"Bucket sort or min-heap O(N log K)",Amazon,30,63.5%,Java
,,,,,,,,,,,
416,"Partition Equal Subset Sum",leetcode,H,DP,www.leetcode.com/problems/partition-equal-subset-sum,2024-03-04,"0/1 Knapsack variation, target = sum / 2",Microsoft,45,46.8%,Python3
,,GFG,Medium,Arrays,https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1,2024-03-05,Missing title row - should be safely skipped,Apple,15,50.0%,C++
322,"Coin Change (Duplicate Entry)",LeetCode,2,"Dynamic Programming, BFS",leetcode.com/problems/coin-change/,03/01/2024,"Duplicate row in file",Google,25,44.2%,Python3
438,"Find All Anagrams in a String",LeetCode,Moderate,"Sliding Window, Hash Table",https://leetcode.com/problems/find-all-anagrams-in-a-string/,1709683200000,"Sliding window with frequency counter match count",Netflix,20,50.4%,TypeScript
,Quick Question,UnknownJudge,Basic,General,,28/02/2024,No URL provided - fallback to default platform and '#' URL,Startup,12,70.0%,Rust


`,
  },
];

for (const file of testFiles) {
  // Write to downloads/recall-test-csvs/
  const subFilePath = path.join(subDir, file.name);
  fs.writeFileSync(subFilePath, file.content, 'utf8');

  // Also write directly to downloads/
  const mainFilePath = path.join(downloadsDir, file.name);
  fs.writeFileSync(mainFilePath, file.content, 'utf8');

  console.log(`Created: ${file.name}`);
}

console.log(`\nSuccessfully created all 10 test CSV files in:\n1. ${subDir}\n2. ${downloadsDir}`);
