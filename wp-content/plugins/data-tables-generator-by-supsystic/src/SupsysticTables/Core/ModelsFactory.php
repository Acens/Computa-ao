<?php


class SupsysticTables_Core_ModelsFactory 
{
    /**
     * @var SocialSharing_Core_BaseModel[]
     */
    protected $models;

    /**
     * @var Rsc_Environment
     */
    protected $environment;

    /**
     * Constructs the models factory
     * @param Rsc_Environment $environment
     */
    public function __construct(Rsc_Environment $environment)
    {
        $this->models = array();
        $this->environment = $environment;
    }

    /**
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     */
    public function factory($model, $module = null)
    {
        $className = $this->getClassName($model, $module);

        if (!class_exists($className)) {
            throw new InvalidArgumentException(
                sprintf('Class "%s" not exists.', $className)
            );
        }

        $class = new $className;

        if ($class instanceof Rsc_Environment_AwareInterface) {
            $class->setEnvironment($this->environment);
        }

        if (method_exists($class, 'onInstanceReady')) {
            $class->onInstanceReady();
        }

        return $class;
    }

    /**
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     * @return SocialSharing_Core_BaseModel
     */
    public function get($model, $module = null)
    {
        $className = $this->getClassName($model, $module);

        try {
            if (!array_key_exists($className, $this->models)) {
                $this->models[$className] = $this->factory($model, $module);
            }
        } catch (InvalidArgumentException $e) {
            throw $e;
        }

        return $this->models[$className];
    }

    /**
     * Builds the model name.
     * @param string $model
     * @param string|Rsc_Mvc_Module $module
     * @return string
     */
    protected function getClassName($model, $module)
    {
        if (!$module) {
            $module = $model;
        }

        if ($module instanceof Rsc_Mvc_Module) {
            $module = $module->getModuleName();
        }

        $prefix = $this->environment->getConfig()->get('plugin_prefix');
        $className = $prefix . '_' . ucfirst($module) . '_Model_' . ucfirst($model);

        return $className;
    }
}