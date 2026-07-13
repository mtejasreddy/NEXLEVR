function ChallengeList({ challenges }) {
  return (
    <div className="challenge-list">
      <h2>Recent Challenges</h2>

      {challenges.map((challenge) => (
        <div key={challenge.id} className="challenge-item">
          <h4>{challenge.title}</h4>
          <p>{challenge.status}</p>
        </div>
      ))}
    </div>
  );
}

export default ChallengeList;
