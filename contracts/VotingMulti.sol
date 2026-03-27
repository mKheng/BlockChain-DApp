// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingMulti {
    address public owner;

    struct Election {
        uint256 id;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 candidateCount;
        bool exists;
    }

    struct Candidate {
        uint256 id;
        string name;
        string role;
        uint256 voteCount;
        bool exists;
    }

    uint256 public electionCount;

    // electionId => Election
    mapping(uint256 => Election) public elections;

    // electionId => candidateId => Candidate
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;

    // electionId => voterAddress => registered?
    mapping(uint256 => mapping(address => bool)) public isRegistered;

    // electionId => voterAddress => voted?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // electionId => voterAddress => candidateId
    mapping(uint256 => mapping(address => uint256)) public votedFor;

    // electionId => voterAddress => cccdHash
    mapping(uint256 => mapping(address => bytes32)) public voterCCCD;

    // electionId => cccdHash => used?
    mapping(uint256 => mapping(bytes32 => bool)) public cccdUsed;

    // ── Events ──────────────────────────────────────────────────────────────────
    event ElectionCreated(uint256 indexed id, string name, uint256 startTime, uint256 endTime);
    event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoterRegistered(uint256 indexed electionId, address indexed voter, bytes32 cccdHash);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 indexed candidateId);
    event ElectionForceEnded(uint256 indexed electionId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Chi owner moi co quyen");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ── Election Management ─────────────────────────────────────────────────────

    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public onlyOwner {
        require(_endTime > _startTime, "endTime phai lon hon startTime");

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            candidateCount: 0,
            exists: true
        });

        emit ElectionCreated(electionCount, _name, _startTime, _endTime);
    }

    function forceEndElection(uint256 _electionId) public onlyOwner {
        require(elections[_electionId].exists, "Cuoc bau cu khong ton tai");
        require(block.timestamp < elections[_electionId].endTime, "Da ket thuc roi");

        elections[_electionId].endTime = block.timestamp;
        emit ElectionForceEnded(_electionId);
    }

    // 0 = Chua bat dau, 1 = Dang dien ra, 2 = Da ket thuc
    function getElectionStatus(uint256 _electionId) public view returns (uint8) {
        Election storage e = elections[_electionId];
        if (!e.exists) return 2;
        if (block.timestamp < e.startTime) return 0;
        if (block.timestamp <= e.endTime) return 1;
        return 2;
    }

    function getElectionInfo(uint256 _electionId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 candidateCount,
        uint8 status
    ) {
        Election storage e = elections[_electionId];
        return (
            e.id,
            e.name,
            e.description,
            e.startTime,
            e.endTime,
            e.candidateCount,
            getElectionStatus(_electionId)
        );
    }

    // ── Candidate Management ────────────────────────────────────────────────────

    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _role
    ) public onlyOwner {
        Election storage e = elections[_electionId];
        require(e.exists, "Cuoc bau cu khong ton tai");
        require(block.timestamp < e.endTime, "Cuoc bau cu da ket thuc");

        e.candidateCount++;
        candidates[_electionId][e.candidateCount] = Candidate({
            id: e.candidateCount,
            name: _name,
            role: _role,
            voteCount: 0,
            exists: true
        });

        emit CandidateRegistered(_electionId, e.candidateCount, _name);
    }

    // ── Voter Registration ──────────────────────────────────────────────────────

    function registerVoter(uint256 _electionId, bytes32 _cccdHash) public {
        Election storage e = elections[_electionId];
        require(e.exists, "Cuoc bau cu khong ton tai");
        require(block.timestamp >= e.startTime, "Chua den thoi gian dang ky");
        require(block.timestamp <= e.endTime, "Da het thoi gian dang ky");
        require(!isRegistered[_electionId][msg.sender], "Da dang ky roi");
        require(!cccdUsed[_electionId][_cccdHash], "CCCD da duoc su dung trong cuoc bau cu nay");

        isRegistered[_electionId][msg.sender] = true;
        voterCCCD[_electionId][msg.sender] = _cccdHash;
        cccdUsed[_electionId][_cccdHash] = true;

        emit VoterRegistered(_electionId, msg.sender, _cccdHash);
    }

    // ── Voting ──────────────────────────────────────────────────────────────────

    function vote(uint256 _electionId, uint256 _candidateId) public {
        Election storage e = elections[_electionId];
        require(e.exists, "Cuoc bau cu khong ton tai");
        require(block.timestamp >= e.startTime, "Chua den thoi gian bo phieu");
        require(block.timestamp <= e.endTime, "Da het thoi gian bo phieu");
        require(isRegistered[_electionId][msg.sender], "Chua dang ky cu tri");
        require(!hasVoted[_electionId][msg.sender], "Da bo phieu roi");
        require(candidates[_electionId][_candidateId].exists, "Ung cu vien khong ton tai");

        candidates[_electionId][_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;
        votedFor[_electionId][msg.sender] = _candidateId;

        emit VoteCast(_electionId, msg.sender, _candidateId);
    }

    // ── Results ─────────────────────────────────────────────────────────────────

    function getElectionResults(uint256 _electionId) public view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory roles,
        uint256[] memory voteCounts
    ) {
        Election storage e = elections[_electionId];
        uint256 count = e.candidateCount;

        ids = new uint256[](count);
        names = new string[](count);
        roles = new string[](count);
        voteCounts = new uint256[](count);

        for (uint256 i = 1; i <= count; i++) {
            Candidate storage c = candidates[_electionId][i];
            ids[i - 1] = c.id;
            names[i - 1] = c.name;
            roles[i - 1] = c.role;
            voteCounts[i - 1] = c.voteCount;
        }
    }
}
