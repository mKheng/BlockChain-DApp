// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;

    struct Candidate {
        uint256 id;
        string name;
        string role;
        uint256 voteCount;
        bool exists;
    }

    uint256 public candidateCount;
    bool public votingOpen;
    bool public registrationOpen;

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public isRegistered;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public votedFor;
    mapping(address => bytes32) public voterCCCD;
    mapping(bytes32 => bool) public cccdUsed;

    event CandidateRegistered(uint256 indexed id, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event VotingStatusChanged(bool isOpen);
    event RegistrationStatusChanged(bool isOpen);
    event VoterRegistered(address indexed voter, bytes32 cccdHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Chi owner moi co quyen");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerCandidate(string memory _name, string memory _role) public onlyOwner {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, _role, 0, true);
        emit CandidateRegistered(candidateCount, _name);
    }

    function setVotingStatus(bool _open) public onlyOwner {
        votingOpen = _open;
        emit VotingStatusChanged(_open);
    }

    function setRegistrationStatus(bool _open) public onlyOwner {
        registrationOpen = _open;
        emit RegistrationStatusChanged(_open);
    }

    function registerVoter(bytes32 cccdHash) public {
        require(registrationOpen, "Dang ky chua mo");
        require(!isRegistered[msg.sender], "Da dang ky roi");
        require(!cccdUsed[cccdHash], "CCCD da duoc su dung");

        isRegistered[msg.sender] = true;
        voterCCCD[msg.sender] = cccdHash;
        cccdUsed[cccdHash] = true;

        emit VoterRegistered(msg.sender, cccdHash);
    }

    function vote(uint256 _candidateId) public {
        require(votingOpen, "Binh chon chua mo");
        require(isRegistered[msg.sender], "Chua dang ky cu tri");
        require(!hasVoted[msg.sender], "Da bo phieu roi");
        require(candidates[_candidateId].exists, "Ung cu vien khong ton tai");

        candidates[_candidateId].voteCount++;
        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = _candidateId;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getResults() public view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory roles,
        uint256[] memory voteCounts
    ) {
        ids = new uint256[](candidateCount);
        names = new string[](candidateCount);
        roles = new string[](candidateCount);
        voteCounts = new uint256[](candidateCount);

        for (uint256 i = 1; i <= candidateCount; i++) {
            ids[i - 1] = candidates[i].id;
            names[i - 1] = candidates[i].name;
            roles[i - 1] = candidates[i].role;
            voteCounts[i - 1] = candidates[i].voteCount;
        }
    }
}
