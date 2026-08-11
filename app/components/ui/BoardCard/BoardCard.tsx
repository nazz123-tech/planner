interface BoardCardProps {
    id: string;
    name: string;
    emoji: string;
    taskDoneCount: number;
    taskCount: number;
    noteCount: number;
    progress: number;
}
export const BoardCard = (board: BoardCardProps) => {
    return (
        <div>
            <h3>{board.name}</h3>
            <span dangerouslySetInnerHTML={{ __html: board.emoji }} />
            <div>
                <p>
                    {board.taskDoneCount} of {board.taskCount}
                </p>
                {board.noteCount > 0 && <p>{board.noteCount}</p>}
            </div>
            <progress value={board.progress} />
        </div>
    );
};

