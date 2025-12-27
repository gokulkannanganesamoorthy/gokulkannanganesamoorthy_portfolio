import { useInView } from 'react-intersection-observer';

const Resume = ({ data }) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="resume" id="resume">
      <div className="container">
        <div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Gokul's Resume</h2>

          <div className="resume-content">
            <div 
              className="resume-intro"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="resume-tagline">{data.resume.tagline}</h3>
              <p className="resume-description">{data.resume.description}</p>
            </div>

            <div className="resume-sections">
              {/* Experience */}
              <div 
                className="resume-section"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
              >
                <h4 className="resume-section-title">Experience</h4>
                {data.resume.experiences.map((exp) => (
                  <div key={exp.id} className="experience-item" variants={itemVariants}>
                    <div className="experience-header">
                      <span className="experience-dates">{exp.dates}</span>
                      <span className="experience-type">{exp.type}</span>
                    </div>
                    <h5 className="experience-position">{exp.position}</h5>
                    <p className="experience-bullets">{exp.bullets}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div 
                className="resume-section"
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
              >
                <h4 className="resume-section-title">Skills</h4>
                <div className="plain-skills-single-line" style={{ fontSize: '0.97rem', lineHeight: 1.65, padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '1.1em', alignItems: 'center' }}>
                  <span><strong>Languages:</strong> {data.resume.languages.join(', ')}</span>
                  <span style={{ fontWeight: 800, opacity: 0.36, fontSize: '1.2em', margin: '0 0.3em' }}>|</span>
                  <span><strong>Frameworks:</strong> {data.resume.frameworks.join(', ')}</span>
                  <span style={{ fontWeight: 800, opacity: 0.36, fontSize: '1.2em', margin: '0 0.3em' }}> </span>
                  <span><strong>Tools:</strong> {data.resume.others.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;