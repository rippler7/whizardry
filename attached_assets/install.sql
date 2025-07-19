
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `aid` int(11) NOT NULL,
  `aname` varchar(255) NOT NULL,
  `astart` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`aid`, `aname`, `astart`) VALUES
(1, 'admin', 1000000),
(2, 'practitioner', 150),
(3, 'noob', 300),
(4, 'commoner', 500),
(5, 'novice', 700),
(6, 'amateur', 1000),
(7, 'expert', 1300),
(8, 'prodigy', 1500),
(9, 'freshie', 0);

-- --------------------------------------------------------

--
-- Table structure for table `questions_answers`
--

CREATE TABLE `questions_answers` (
  `qid` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `scores`
--

CREATE TABLE `scores` (
  `id` int(11) NOT NULL,
  `elapsedTime` varchar(200) NOT NULL,
  `scoredate` varchar(255) NOT NULL,
  `score` int(11) NOT NULL DEFAULT '0',
  `timespent` varchar(255) NOT NULL,
  `uid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `scores`
--

INSERT INTO `scores` (`id`, `elapsedTime`, `scoredate`, `score`, `timespent`, `uid`) VALUES
(4, '00:00:06', '2018-07-31 20:25:37', 26, '6', 1),
(5, '00:00:06', '2018-07-31 20:27:56', 27, '6', 1),
(7, '00:09:24', '2018-08-01 00:29:32', 544, '564', 1),
(8, '00:00:09', '2018-08-01 01:07:05', 15, '9', 18),
(12, '00:08:01', '2018-08-01 20:40:56', 569, '481', 16),
(13, '00:03:46', '2018-08-02 01:12:11', 274, '226', 1),
(14, '00:03:16', '2018-08-02 01:17:48', 281, '196', 19),
(15, '00:13:30', '2018-08-05 16:35:38', 886, '810', 19),
(16, '00:00:10', '2018-08-05 20:46:00', 18, '16', 16),
(17, '00:00:13', '2018-08-05 20:47:45', 18, '13', 16),
(18, '00:00:37', '2018-08-05 20:52:09', 34, '37', 16),
(19, '00:00:30', '2018-08-06 12:45:22', 52, '31', 1),
(20, '00:00:11', '2018-08-06 16:58:32', 18, '12', 1),
(21, '00:00:10', '2018-08-06 18:10:49', 18, '11', 16),
(22, '00:04:52', '2018-08-06 18:16:16', 366, '292', 16),
(23, '00:09:13', '2018-08-06 19:24:06', 561, '554', 1),
(24, '00:00:10', '2018-08-06 23:23:04', 18, '11', 1),
(25, '00:00:18', '2018-08-06 23:23:54', 22, '19', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first` varchar(255) DEFAULT NULL,
  `last` varchar(255) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `totalplayed` varchar(255) NOT NULL,
  `levelid` int(11) NOT NULL DEFAULT '2',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first`, `last`, `username`, `password`, `email`, `totalplayed`, `levelid`, `created_at`) VALUES
(1, 'admin', 'admin', 'admin', '$2y$10$dUIiUISeqsy80bG.eqP3kexVNd70G.DJCSHsKOZ01CAqHPeOgna0y', 'darkse7enth@gmail.com', '1429', 4, '2018-07-26 00:10:55'),
(16, 'jeremy', 'ancog', 'jerms', '$2y$10$konILZfgVtcZJ3nw6Ewxn.rA4rlio/aJ9irrmvShHRvtxL.C9Xcae', 'darkse7enth@gmail.com', '850', 4, '2018-07-30 22:22:44'),
(18, 'tester', 'someguy', 'tester', '$2y$10$xnR8Wl.kiXu5Yu7akZUoxeXFKLZCAn0Vh6TLQURnqlYJdRd.fF19.', 'test@tester.com', '9', 9, '2018-07-30 23:34:15'),
(19, 'qa', 'guy', 'qaguy', '$2y$10$Mm/eyhgcgXUI4Mi6RAwx/eqHZ4Fl.ke0.BYk7Xi5ADfdbojUBIGdm', 'qaguy@email.com', '1006', 5, '2018-08-02 07:14:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`aid`);

--
-- Indexes for table `questions_answers`
--
ALTER TABLE `questions_answers`
  ADD PRIMARY KEY (`qid`);

--
-- Indexes for table `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uid` (`uid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `levelid` (`levelid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `aid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `questions_answers`
--
ALTER TABLE `questions_answers`
  MODIFY `qid` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `scores`
--
ALTER TABLE `scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `scores`
--
ALTER TABLE `scores`
  ADD CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`levelid`) REFERENCES `achievements` (`aid`);

