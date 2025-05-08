// components/Footer.tsx
const Footer = () => {
    return (
      <footer className="bg-gray-300 text-black p-6 mt-10">
        <div className="flex justify-between">
          <div className="text-2xl font-bold">🅱</div>
          <div className="flex space-x-4">
            <span>📷</span>
            <span>🎥</span>
            <span>🔗</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h4 className="font-bold">Use cases</h4>
            <ul>
              <li>UI design</li>
              <li>UX design</li>
              <li>Wireframing</li>
              <li>Diagramming</li>
              <li>Brainstorming</li>
              <li>Online whiteboard</li>
              <li>Team collaboration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold">Explore</h4>
            <ul>
              <li>Design</li>
              <li>Prototyping</li>
              <li>Development features</li>
              <li>Design systems</li>
              <li>Collaboration features</li>
              <li>Design process</li>
              <li>FigJam</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold">Resources</h4>
            <ul>
              <li>Blog</li>
              <li>Best practices</li>
              <li>Colors</li>
              <li>Color wheel</li>
              <li>Support</li>
              <li>Developers</li>
              <li>Resource library</li>
            </ul>
          </div>
        </div>
      </footer>
    );
  };
  


  export default Footer