import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Services = ({ data }) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true // triggers only when scrolled into view
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: (i) => ({
      opacity: 0,
      x: i % 2 === 0 ? -300 : 300,
      rotate: i % 2 === 0 ? -5 : 5,
      scale: 0.9
    }),
    visible: {
      opacity: 1,
      x: 0,
      rotate: 0,
      scale: 1,
      transition: {
        type: "tween",
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="services" id="services">
      <div className="container" ref={ref}>
        <h2 className="section-title">
          What Gokul Does ?
        </h2>
        <motion.div 
          className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {data.services.map((service, i) => (
            <motion.div
              key={service.id}
              className="service-card"
              custom={i}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
